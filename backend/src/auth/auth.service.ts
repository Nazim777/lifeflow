import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../users/schemas/user.schema';

import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private emailService: EmailService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);

        if (user && (await bcrypt.compare(pass, user.password))) {
            if (user.isBlocked) {
                throw new UnauthorizedException('Your account has been blocked. Please contact admin.');
            }
            if (!user.isVerified) {
                throw new UnauthorizedException('Your account is pending verification. Please wait for admin approval.');
            }

            // Verification passed

            const { password, ...result } = (user as UserDocument).toObject();
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user._id, role: user.role };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        await this.usersService.updateRefreshToken(user._id, await bcrypt.hash(refreshToken, 10));

        // Fetch Profile if needed
        let profile: any = null;
        if (user.role === 'hospital') {
            profile = await this.usersService.getHospitalProfile(user._id);
        } else if (user.role === 'donor') {
            profile = await this.usersService.getDonorProfile(user._id);
        } else if (user.role === 'recipient') {
            profile = await this.usersService.getRecipientProfile(user._id);
        }

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                isVerified: user.isVerified, // Critical Fix
                hospitalProfile: profile // Critical Fix
            }
        };
    }

    async register(createUserDto: any) {
        console.log('Registering user:', createUserDto.email, createUserDto.role, 'Name:', createUserDto.name);

        if (!createUserDto.name) {
            throw new Error('Validation Failed: Name is required for registration.');
        }

        const user = await this.usersService.create(createUserDto);
        console.log('User created:', user._id);

        try {
            // Create Profile based on role
            if (createUserDto.role === 'hospital') {
                console.log('Creating hospital profile for:', user._id, 'Name:', createUserDto.name);
                await this.usersService.createHospitalProfile(user._id.toString(), {
                    institutionName: createUserDto.name,
                    contactPerson: 'Pending', // Default
                    licenseNumber: 'Pending', // Default
                    contactNumber: 'Pending', // Default
                    location: { city: 'Unknown', area: 'Unknown' } // Default
                });
                console.log('Hospital profile created successfully');
            } else if (createUserDto.role === 'donor') {
                console.log('Creating donor profile for:', user._id);
                await this.usersService.createDonorProfile(user._id.toString(), {
                    name: createUserDto.name,
                    // bloodGroup, etc. are optional now
                });
            } else if (createUserDto.role === 'recipient') {
                console.log('Creating recipient profile for:', user._id);
                await this.usersService.createRecipientProfile(user._id.toString(), {
                    name: createUserDto.name,
                    location: { city: 'Unknown', area: 'Unknown' }
                });
            }
        } catch (error) {
            console.error('FAILED to create profile:', error);
            // Optional: rollback user creation?
        }

        return user;
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) return { message: 'If account exists, email sent' }; // Privacy

        const token = await bcrypt.genSalt(); // Using salt as random token for simplicity
        await this.usersService.updateResetToken((user as any)._id, token);

        // Send Email (Mocked or Real)
        await this.emailService.sendMail(
            email,
            'Password Reset Request',
            `Use this token to reset your password: ${token}`,
            `<p>Use this token or link to reset: <b>${token}</b></p>`
        );

        return { message: 'Email sent' };
    }

    async resetPassword(token: string, newPass: string) {
        const user = await this.usersService.findOneByResetToken(token);
        if (!user) throw new UnauthorizedException('Invalid or expired token');

        const hashedPassword = await bcrypt.hash(newPass, 10);
        await this.usersService.updatePassword((user as any)._id, hashedPassword);

        return { message: 'Password reset successful' };
    }
}
