import { Controller, Request, Post, UseGuards, Get, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService
    ) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Post('register')
    async register(@Body() createUserDto: any) {
        return this.authService.register(createUserDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async getProfile(@Request() req) {
        // Fetch fresh user data from DB instead of returning JWT payload
        const user = await this.usersService.findById(req.user.userId);
        if (!user) return null;

        let profile: any = null;
        if (user.role === 'hospital') {
            profile = await this.usersService.getHospitalProfile(user._id.toString());
        } else if (user.role === 'donor') {
            profile = await this.usersService.getDonorProfile(user._id.toString());
        } else if (user.role === 'recipient') {
            profile = await this.usersService.getRecipientProfile(user._id.toString());
        }

        return {
            ...user.toObject(),
            hospitalProfile: profile, // Ensure profile is included if needed for Dashboard
            donorProfile: user.role === 'donor' ? profile : undefined,
            recipientProfile: user.role === 'recipient' ? profile : undefined
        };
    }

    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    async resetPassword(@Body() body: any) {
        return this.authService.resetPassword(body.token, body.password);
    }
}
