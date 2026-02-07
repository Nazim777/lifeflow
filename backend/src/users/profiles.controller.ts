import { Controller, Get, Post, Body, Patch, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from './schemas/user.schema';

@Controller('profiles')
@UseGuards(AuthGuard('jwt'))
export class ProfilesController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    async getMyProfile(@Request() req) {
        const { userId, role } = req.user;
        if (role === UserRole.HOSPITAL) {
            return this.usersService.getHospitalProfile(userId);
        } else if (role === UserRole.RECIPIENT) {
            return this.usersService.getRecipientProfile(userId);
        }
        return this.usersService.getDonorProfile(userId);
    }

    @Patch('me')
    async updateMyProfile(@Request() req, @Body() body: any) {
        const { userId, role } = req.user;
        if (role === UserRole.HOSPITAL) {
            return this.usersService.updateHospitalProfile(userId, body);
        } else if (role === UserRole.RECIPIENT) {
            return this.usersService.updateRecipientProfile(userId, body);
        }
        return this.usersService.updateDonorProfile(userId, body);
    }
}
