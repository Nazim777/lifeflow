import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BloodRequest, BloodRequestDocument } from './schemas/blood-request.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { UsersService } from '../users/users.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class RequestsService implements OnModuleInit {
    private readonly logger = new Logger(RequestsService.name);

    constructor(
        @InjectModel(BloodRequest.name) private requestModel: Model<BloodRequestDocument>,
        private notificationsService: NotificationsService,
        private usersService: UsersService,
        private inventoryService: InventoryService,
    ) { }

    async onModuleInit() {
        try {
            const requestCollection = this.requestModel.collection;

            // 1. Unset empty/invalid hospitalId (Optional field, safe to unset)
            const hospitalResult = await requestCollection.updateMany(
                { $or: [{ hospitalId: "" }, { hospitalId: null }, { hospitalId: { $type: "string", $regex: /^$/ } }] },
                { $unset: { hospitalId: "" } }
            );
            if (hospitalResult.modifiedCount > 0) {
                this.logger.warn(`Cleaned up ${hospitalResult.modifiedCount} requests with invalid hospitalId`);
            }

            // 2. Unset empty/invalid assignedDonorId (Optional field, safe to unset)
            const donorResult = await requestCollection.updateMany(
                { $or: [{ assignedDonorId: "" }, { assignedDonorId: null }, { assignedDonorId: { $type: "string", $regex: /^$/ } }] },
                { $unset: { assignedDonorId: "" } }
            );
            if (donorResult.modifiedCount > 0) {
                this.logger.warn(`Cleaned up ${donorResult.modifiedCount} requests with invalid assignedDonorId`);
            }

            // 3. Delete requests with invalid requesterId (Required field, must delete if missing)
            const deleteResult = await requestCollection.deleteMany({
                $or: [
                    { requesterId: "" },
                    { requesterId: null },
                    { requesterId: { $type: "string", $regex: /^$/ } }
                ]
            });
            if (deleteResult.deletedCount > 0) {
                this.logger.warn(`Deleted ${deleteResult.deletedCount} requests with invalid requesterId`);
            }
        } catch (error) {
            this.logger.error(`Failed to cleanup invalid requests: ${error.message}`);
        }
    }

    async create(createRequestDto: any): Promise<BloodRequest> {
        // 1. Validate Required Date
        const requiredDate = new Date(createRequestDto.requiredDate);
        if (requiredDate < new Date()) {
            throw new BadRequestException('Required date cannot be in the past');
        }

        // 2. Check Active Request Limit (Max 3 Pending per Requester)
        const activeCount = await this.requestModel.countDocuments({
            requesterId: createRequestDto.requesterId,
            status: 'pending'
        });

        if (activeCount >= 3) {
            throw new BadRequestException('You have reached the limit of 3 active pending requests.');
        }

        // 3. Auto-set ExpiresAt (e.g., 24h after required date or default)
        // If not provided, default to 24h after requiredDate
        const expiresAt = createRequestDto.expiresAt ? new Date(createRequestDto.expiresAt) : new Date(requiredDate.getTime() + 24 * 60 * 60 * 1000);

        const createdRequest = new this.requestModel({
            ...createRequestDto,
            requiredDate,
            expiresAt
        });
        return createdRequest.save();
    }

    async findAll(query: any = {}): Promise<BloodRequest[]> {
        // Privacy: Do not expose email in public list
        const filter = { ...query };
        if (query.hospitalId) {
            filter.hospitalId = query.hospitalId;
        }
        return this.requestModel.find(filter)
            .populate('requesterId', 'name')
            .populate('hospitalId', 'institutionName')
            .exec();
    }

    async findOne(id: string): Promise<BloodRequest> {
        const request = await this.requestModel.findById(id).populate('requesterId', 'name email').exec();
        if (!request) {
            throw new NotFoundException(`Request with ID ${id} not found`);
        }
        return request;
    }

    async update(id: string, updateRequestDto: any): Promise<BloodRequest | null> {
        const existingRequest = await this.requestModel.findById(id);
        if (!existingRequest) {
            throw new NotFoundException(`Request with ID ${id} not found`);
        }

        if (existingRequest.status !== 'pending' && updateRequestDto.status === undefined) {
            // Allow status updates (e.g. to completed) but prevent editing details if not pending
            // Check if we are updating fields other than status
            const nonStatusUpdates = Object.keys(updateRequestDto).some(k => k !== 'status' && k !== 'assignedDonorId');
            if (nonStatusUpdates) {
                throw new BadRequestException('Cannot edit request details once accepted or completed.');
            }
        }

        const updatedRequest = await this.requestModel
            .findByIdAndUpdate(id, updateRequestDto, { new: true })
            .populate('requesterId') // Populate to get user ID for notification
            .exec();

        if (!updatedRequest) {
            throw new NotFoundException(`Request with ID ${id} not found`);
        }

        // Notification Logic
        if (updateRequestDto.status && updateRequestDto.status !== existingRequest.status) {
            const requesterId = (updatedRequest.requesterId as any)._id; // Assuming populated

            if (updateRequestDto.status === 'accepted') {
                await this.notificationsService.create({
                    userId: requesterId,
                    title: 'Request Accepted',
                    message: `Your blood request for ${updatedRequest.patientName} has been accepted.`,
                    type: NotificationType.STATUS,
                });
            } else if (updateRequestDto.status === 'completed') {
                await this.notificationsService.create({
                    userId: requesterId,
                    title: 'Donation Completed',
                    message: `Your blood request for ${updatedRequest.patientName} has been marked as completed.`,
                    type: NotificationType.STATUS,
                });
            }
        }

        return updatedRequest;
    }

    async canAcceptRequest(donorId: string, lastDonationDate: Date): Promise<boolean> {
        if (!lastDonationDate) return true;
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        return lastDonationDate <= ninetyDaysAgo;
    }

    async accept(requestId: string, donorId: string) {
        // 1. Check Request
        const request = await this.requestModel.findById(requestId);
        if (!request) throw new NotFoundException('Request not found');
        if (request.status !== 'pending') throw new BadRequestException('Request is not pending');

        // 2. Check Donor Profile (Availability & Eligibility)
        const donorProfile = await this.usersService.getDonorProfile(donorId);
        if (!donorProfile) throw new NotFoundException('Donor profile not found');

        // Check Availability
        if (!donorProfile.availability) throw new ForbiddenException('You are currently unavailable');

        // Check Eligibility
        const eligibility = (donorProfile as any).isEligible !== undefined
            ? (donorProfile as any).isEligible
            // Fallback if getDonorProfile didn't calculate it (e.g. if I missed updating the return type in service to be explicit, but I did update it to return object with virtuals)
            : this.checkEligibilityManual(donorProfile);

        if (!eligibility) throw new ForbiddenException('You are not eligible to donate yet.');

        // 3. Check Blood Group Compatibility
        // Strict Match as per requirement "matching: Blood group"
        if (request.bloodGroup !== donorProfile.bloodGroup) {
            throw new ForbiddenException(`Blood group mismatch. Request requires ${request.bloodGroup}, you are ${donorProfile.bloodGroup}`);
        }

        // 4. Check for Active Requests
        const activeRequest = await this.requestModel.findOne({
            assignedDonorId: donorId,
            status: { $in: ['accepted', 'in_progress'] } // assuming in_progress is a state
        });
        if (activeRequest) throw new BadRequestException('You already have an active donation request');

        // 5. Update Request
        request.assignedDonorId = donorId as any;
        request.status = 'accepted';
        await request.save();

        // 5. Update Donor Availability
        await this.usersService.updateDonorProfile(donorId, { availability: false });

        // 6. Notify Requester
        const requesterId = (request.requesterId as any)._id || request.requesterId;
        await this.notificationsService.create({
            userId: requesterId,
            title: 'Donor Found!',
            message: `A donor has accepted your request for ${request.patientName}.`,
            type: NotificationType.STATUS,
        });

        return request;
    }

    async cancel(id: string, userId: string) {
        const request = await this.requestModel.findById(id);
        if (!request) throw new NotFoundException('Request not found');

        // Verify Ownership
        if ((request.requesterId as any).toString() !== userId) {
            throw new ForbiddenException('You can only cancel your own requests');
        }

        if (request.status !== 'pending') {
            throw new BadRequestException('Only pending requests can be cancelled');
        }

        request.status = 'cancelled';
        return request.save();
    }

    private checkEligibilityManual(profile: any) {
        if (!profile.lastDonationDate) return true;
        const lastDate = new Date(profile.lastDonationDate);
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + 90);
        return new Date() >= nextDate;
    }

    // Hospital: Approve Request
    async approveRequest(requestId: string, hospitalId: string) {
        const request = await this.requestModel.findById(requestId);
        if (!request) throw new NotFoundException('Request not found');

        // Check ownership if hospitalId is set on request?
        // Spec says "Hospital can View incoming blood requests... Accept or reject".
        // Assuming requests can be targeted to a hospital OR public.
        // If targeted, verify hospitalId matches.
        if (request.hospitalId && (request.hospitalId as any).toString() !== hospitalId) {
            throw new ForbiddenException('This request is not assigned to your hospital');
        }

        if (request.status !== 'pending') throw new BadRequestException('Only pending requests can be approved');

        request.status = 'approved';
        await request.save();

        // Notify Requester
        const requesterId = (request.requesterId as any)._id || request.requesterId;
        await this.notificationsService.create({
            userId: requesterId,
            title: 'Request Approved',
            message: `Your blood request for ${request.patientName} has been approved by the hospital.`,
            type: NotificationType.STATUS,
        });

        return request;
    }

    // Hospital: Reject Request
    async rejectRequest(requestId: string, hospitalId: string) {
        const request = await this.requestModel.findById(requestId);
        if (!request) throw new NotFoundException('Request not found');

        if (request.hospitalId && (request.hospitalId as any).toString() !== hospitalId) {
            throw new ForbiddenException('This request is not assigned to your hospital');
        }

        if (request.status !== 'pending') throw new BadRequestException('Only pending requests can be rejected');

        request.status = 'rejected';
        await request.save();

        // Notify Requester
        const requesterId = (request.requesterId as any)._id || request.requesterId;
        await this.notificationsService.create({
            userId: requesterId,
            title: 'Request Rejected',
            message: `Your blood request for ${request.patientName} has been rejected by the hospital.`,
            type: NotificationType.STATUS,
        });

        return request;
    }

    // Hospital: Complete Request (Fulfillment from Inventory)
    async completeRequest(requestId: string, hospitalId: string) {
        const request = await this.requestModel.findById(requestId);
        if (!request) throw new NotFoundException('Request not found');

        if (request.status === 'completed') throw new BadRequestException('Request already completed');

        // Logic: Deduct from Inventory
        // We assume the Hospital Fulfilling it is the `hospitalId` passed (logged in user)
        // Check if hospital has enough stock
        try {
            await this.inventoryService.decrementStock(hospitalId, request.bloodGroup, request.units);
        } catch (error) {
            throw new BadRequestException(error.message); // "Insufficient stock..."
        }

        request.status = 'completed';
        // hospitalId fulfilling it?
        // request.hospitalId = hospitalId; // Update if not set?
        await request.save();

        // Notify Requester
        const requesterId = (request.requesterId as any)._id || request.requesterId;
        await this.notificationsService.create({
            userId: requesterId,
            title: 'Request Fulfilled',
            message: `Your blood request has been fulfilled by the hospital.`,
            type: NotificationType.STATUS,
        });

        return request;
    }

    // Hospital: Assign Donor manually
    async assignDonor(requestId: string, donorId: string, hospitalId: string) {
        const request = await this.requestModel.findById(requestId);
        if (!request) throw new NotFoundException('Request not found');

        // request.hospitalId check? 

        request.assignedDonorId = donorId as any;
        request.status = 'accepted';
        await request.save();

        // Notify Donor? "You have been assigned..."
        return request;
    }
}
