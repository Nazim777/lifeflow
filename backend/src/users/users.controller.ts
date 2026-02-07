import { Controller, Get, UseGuards, Patch, Delete, Param, Req, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './schemas/user.schema';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles(UserRole.ADMIN)
    findAll(@Query() query) {
        return this.usersService.findAll(query);
    }

    @Get('hospitals')
    @UseGuards(AuthGuard('jwt'))
    getHospitals(@Req() req) {
        return this.usersService.findAllHospitals(req.query);
    }

    @Get('donors')
    @UseGuards(AuthGuard('jwt'))
    @Roles(UserRole.RECIPIENT, UserRole.ADMIN, UserRole.HOSPITAL)
    searchDonors(@Req() req) {
        return this.usersService.searchDonors(req.query);
    }

    @Get('stats')
    @Roles(UserRole.ADMIN)
    getStats() {
        return this.usersService.getStats();
    }

    @Patch(':id/verify')
    @Roles(UserRole.ADMIN)
    async verifyUser(@Param('id') id: string) {
        // Build logic to dispatch based on user type if needed, or just default.
        // For now, let's look up user first?
        // Or just use verifyHospital if we know it's a hospital?
        // Simplest: Generic verifyUser in Service handles all?
        // Let's modify UsersService.verifyUser to check role?
        // No, let's keep it simple. verifyUser verifies the User document.
        // But we added verifyHospital in service. Let's start using it.
        return this.usersService.verifyUser(id);
    }

    @Patch(':id/verify-hospital')
    @Roles(UserRole.ADMIN)
    verifyHospital(@Param('id') id: string) {
        return this.usersService.verifyHospital(id);
    }

    @Patch(':id/unverify')
    @Roles(UserRole.ADMIN)
    unverifyUser(@Param('id') id: string) {
        return this.usersService.unverifyUser(id);
    }

    @Patch(':id/block')
    @Roles(UserRole.ADMIN)
    blockUser(@Param('id') id: string) {
        return this.usersService.blockUser(id);
    }

    @Patch(':id/unblock')
    @Roles(UserRole.ADMIN)
    unblockUser(@Param('id') id: string) {
        return this.usersService.unblockUser(id);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }
}
