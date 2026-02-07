import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { DonorProfile, DonorProfileDocument } from './schemas/donor-profile.schema';
import { HospitalProfile, HospitalProfileDocument } from './schemas/hospital-profile.schema';
import { RecipientProfile, RecipientProfileDocument } from './schemas/recipient-profile.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(DonorProfile.name) private donorProfileModel: Model<DonorProfileDocument>,
        @InjectModel(HospitalProfile.name) private hospitalProfileModel: Model<HospitalProfileDocument>,
        @InjectModel(RecipientProfile.name) private recipientProfileModel: Model<RecipientProfileDocument>,
    ) { }

    async create(createUserDto: any): Promise<UserDocument> {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
        // FORCE isVerified: false for new users (Admin must approve)
        const createdUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
            name: createUserDto.name, // Explicitly save name
            isVerified: false,
            isBlocked: false
        });
        return createdUser.save();
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        return this.userModel.findByIdAndUpdate(userId, { refreshToken });
    }

    async createDonorProfile(userId: string, profileDto: any) {
        const profile = new this.donorProfileModel({ ...profileDto, userId });
        return profile.save();
    }

    async getDonorProfile(userId: string) {
        const profile = await this.donorProfileModel.findOne({ userId }).lean().exec();
        if (!profile) return null;
        return {
            ...profile,
            ...this.calculateEligibility(profile)
        };
    }

    private calculateEligibility(profile: any) {
        if (!profile.lastDonationDate) {
            return { isEligible: true, nextEligibleDate: null };
        }

        const lastDate = new Date(profile.lastDonationDate);
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + 90); // 90 days gap

        const today = new Date();
        const isEligible = today >= nextDate;

        return {
            isEligible,
            nextEligibleDate: isEligible ? null : nextDate
        };
    }

    async updateDonorProfile(userId: string, profileDto: any) {
        // Enforce Blood Group Immutability
        const existingProfile = await this.donorProfileModel.findOne({ userId }).exec();
        if (existingProfile && existingProfile.bloodGroup && profileDto.bloodGroup) {
            if (existingProfile.bloodGroup !== profileDto.bloodGroup) {
                delete profileDto.bloodGroup; // Silently ignore or throw error? Let's ignore to be safe or maybe throw?
                // Ideally throwing error is better for feedback
                // throw new ForbiddenException('Blood Group cannot be changed once set');
                // For now, let's just delete it from DTO to prevent update
            }
        }

        return this.donorProfileModel.findOneAndUpdate({ userId }, profileDto, { new: true, upsert: true }).exec();
    }

    async createHospitalProfile(userId: string, profileDto: any) {
        try {
            console.log('Saving Hospital Profile:', { userId, ...profileDto });
            const profile = new this.hospitalProfileModel({ ...profileDto, userId });
            return await profile.save();
        } catch (error) {
            console.error('Error in createHospitalProfile:', error);
            throw error;
        }
    }

    async getHospitalProfile(userId: string) {
        return this.hospitalProfileModel.findOne({ userId }).exec();
    }

    async updateHospitalProfile(userId: string, profileDto: any) {
        return this.hospitalProfileModel.findOneAndUpdate({ userId }, profileDto, { new: true, upsert: true }).exec();
    }

    async createRecipientProfile(userId: string, profileDto: any) {
        const profile = new this.recipientProfileModel({ ...profileDto, userId });
        return profile.save();
    }

    async getRecipientProfile(userId: string) {
        return this.recipientProfileModel.findOne({ userId }).exec();
    }

    async updateRecipientProfile(userId: string, profileDto: any) {
        return this.recipientProfileModel.findOneAndUpdate({ userId }, profileDto, { new: true, upsert: true }).exec();
    }

    async findOneByResetToken(token: string): Promise<User | null> {
        return this.userModel.findOne({ resetPasswordToken: token }).exec();
    }

    async updateResetToken(userId: string, token: string | null) {
        return this.userModel.findByIdAndUpdate(userId, { resetPasswordToken: token });
    }

    async updatePassword(userId: string, hashedPassword: string) {
        return this.userModel.findByIdAndUpdate(userId, { password: hashedPassword, resetPasswordToken: null });
    }
    async findAll(query: any = {}): Promise<User[]> {
        const filter: any = {};
        if (query.role) filter.role = query.role;
        if (query.isVerified !== undefined) filter.isVerified = query.isVerified === 'true';
        if (query.isBlocked !== undefined) filter.isBlocked = query.isBlocked === 'true';

        return this.userModel.find(filter, '-password').sort({ createdAt: -1 }).exec();
    }

    async getStats() {
        const totalUsers = await this.userModel.countDocuments();
        const donors = await this.userModel.countDocuments({ role: UserRole.DONOR });
        const hospitals = await this.userModel.countDocuments({ role: UserRole.HOSPITAL });

        const pendingHospitals = await this.userModel.countDocuments({ role: UserRole.HOSPITAL, isVerified: false });
        const pendingDonors = await this.userModel.countDocuments({ role: UserRole.DONOR, isVerified: false });
        const pendingRecipients = await this.userModel.countDocuments({ role: UserRole.RECIPIENT, isVerified: false });

        const activeDonors = await this.donorProfileModel.countDocuments({ availability: true });

        return {
            totalUsers,
            donors,
            hospitals,
            pendingHospitals,
            pendingDonors,
            pendingRecipients,
            activeDonors
        };
    }

    async verifyUser(id: string): Promise<User | null> {
        return this.userModel.findByIdAndUpdate(id, { isVerified: true }, { new: true }).exec();
    }

    async verifyHospital(id: string): Promise<User | null> {
        // Ensure profile exists
        const profile = await this.hospitalProfileModel.findOne({ userId: id });
        if (!profile) {
            throw new Error('Hospital profile incomplete');
        }
        return this.verifyUser(id);
    }

    async unverifyUser(id: string): Promise<User | null> {
        return this.userModel.findByIdAndUpdate(id, { isVerified: false }, { new: true }).exec();
    }

    async blockUser(id: string): Promise<User | null> {
        return this.userModel.findByIdAndUpdate(id, { isBlocked: true }, { new: true }).exec();
    }

    async unblockUser(id: string): Promise<User | null> {
        return this.userModel.findByIdAndUpdate(id, { isBlocked: false }, { new: true }).exec();
    }

    async deleteUser(id: string): Promise<User | null> {
        return this.userModel.findByIdAndDelete(id).exec();
    }



    async findAllHospitals(query: any = {}): Promise<any[]> {
        const filter: any = { role: 'hospital', isVerified: true };

        // If city is provided, filter by profile location first
        let specificUserIds: string[] | null = null;
        if (query.city) {
            // Case-insensitive city search in profiles
            const profiles = await this.hospitalProfileModel.find({
                "location.city": { $regex: new RegExp(query.city.trim(), 'i') }
            }).exec();
            specificUserIds = profiles.map(p => p.userId.toString());
            filter._id = { $in: specificUserIds };
        }

        // Fetch users (hospitals) matching the filter
        const users = await this.userModel.find(filter, '-password').lean().exec();

        // Fetch profiles for these users to merge detailed info (institution name, etc.)
        const userIds = users.map(u => u._id);
        const profiles = await this.hospitalProfileModel.find({ userId: { $in: userIds } }).lean().exec();

        // Create a Map for O(1) lookup: userId (string) -> profile
        const profileMap = new Map();
        profiles.forEach(p => {
            if (p.userId) {
                profileMap.set(p.userId.toString(), p);
            }
        });

        console.log(`Debug: Found ${users.length} hospitals (users)`);
        console.log(`Debug: Found ${profiles.length} hospital profiles`);

        // Merge User + Profile data
        return users.map(user => {
            const profile = profileMap.get(user._id.toString());
            // Prioritize user.name (from User doc), then profile, then email
            const displayName = user.name || profile?.institutionName || user.email;

            if (!profile) {
                console.log(`Debug: Missing profile for user ${user.email} (${user._id})`);
                console.log('Debug: User object dump:', { email: user.email, name: user.name, role: user.role });
            } else {
                console.log(`Debug: Found profile for ${user.email}: ${profile.institutionName}`);
            }

            return {
                ...user,
                ...(profile || {}), // Spread profile properties (location, etc.)
                institutionName: displayName, // Ensure institutionName is populated
                name: displayName, // Also populate name for generic usages
                location: profile?.location || { city: 'Unknown', area: '' }, // Fallback for location to avoid UI glitches
                _id: user._id // Ensure _id remains the User ID
            };
        });
    }

    async searchDonors(query: any = {}): Promise<any[]> {
        const filter: any = {};

        if (query.bloodGroup) {
            filter.bloodGroup = query.bloodGroup;
        }
        if (query.city) {
            filter["location.city"] = { $regex: new RegExp(query.city.trim(), 'i') }; // Case insensitive, trimmed
        }
        if (query.availability) {
            filter.availability = query.availability === 'true';
        }

        // Find profiles first
        const profiles = await this.donorProfileModel.find(filter).lean().exec();

        // Return limited data (Privacy)
        // Return limited data (Privacy)
        return profiles.map(p => {
             // Calculate dynamic eligibility
             const eligibility = this.calculateEligibility(p);
             
             // Final availability is explicit availability AND eligibility
             const isAvailable = p.availability && eligibility.isEligible;

             return {
                _id: p.userId, // Return userId for linking if needed, but not full user obj
                name: p.name,
                bloodGroup: p.bloodGroup,
                location: p.location,
                availability: isAvailable,
                lastDonationDate: p.lastDonationDate // expose for frontend debugging or messages if needed
            };
        });
    }
}
