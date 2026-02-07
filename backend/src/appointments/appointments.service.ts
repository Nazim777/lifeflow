import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { DonorProfile, DonorProfileDocument } from '../users/schemas/donor-profile.schema';

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
        @InjectModel(DonorProfile.name) private donorProfileModel: Model<DonorProfileDocument>,
    ) { }

    async create(createAppointmentDto: CreateAppointmentDto, donorId: string): Promise<Appointment> {
        const newAppointment = new this.appointmentModel({
            ...createAppointmentDto,
            donorId,
        });
        return newAppointment.save();
    }

    async findAll(userId: string, role: string): Promise<any[]> {
        let query = {};
        if (role === 'hospital') {
            query = { hospitalId: userId };
        } else {
            query = { donorId: userId };
        }

        const appointments = await this.appointmentModel.find(query)
            .populate('donorId', 'name email') // We still want user name/email as fallback
            .populate('hospitalId', 'name institutionName location phone')
            .sort({ date: 1 }) // Nearest first
            .lean()
            .exec();

        // If user is hospital, they need donor details (blood group, phone, etc.)
        // These are in DonorProfile, not User
        if (role === 'hospital') {
            const donorIds = appointments.map(a => (a.donorId as any)._id || a.donorId);
            const profiles = await this.donorProfileModel.find({ userId: { $in: donorIds } }).lean().exec();

            const profileMap = new Map();
            profiles.forEach(p => profileMap.set(p.userId.toString(), p));

            return appointments.map(app => {
                const donorIdStr = (app.donorId as any)._id ? (app.donorId as any)._id.toString() : app.donorId.toString();
                const profile = profileMap.get(donorIdStr);

                if (profile) {
                    // Merge profile data into donorId object
                    return {
                        ...app,
                        donorId: {
                            ...(app.donorId as any),
                            bloodGroup: profile.bloodGroup,
                            phone: profile.phone || (app.donorId as any).phone, // Profile phone or user phone
                            // Add other needed fields
                        }
                    };
                }
                return app;
            });
        }

        return appointments;
    }

    async updateStatus(id: string, status: string, userId: string): Promise<Appointment> {
        const appointment = await this.appointmentModel.findById(id);
        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        // Authorization check
        // Only hospital can change to confirmed/completed/rejected
        // Donor can cancel
        // We assume the controller passes the correct userId

        // Check if user is related to this appointment
        if (appointment.hospitalId.toString() !== userId && appointment.donorId.toString() !== userId) {
            throw new ForbiddenException('You are not authorized to update this appointment');
        }

        if (appointment.donorId.toString() === userId) {
            // Donor can only cancel
            if (status !== 'cancelled') {
                throw new ForbiddenException('Donors can only cancel appointments');
            }
        }

        appointment.status = status;
        return appointment.save();
    }
}
