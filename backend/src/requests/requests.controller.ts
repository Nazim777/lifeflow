import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('requests')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RequestsController {
    constructor(private readonly requestsService: RequestsService) { }

    @Post()
    @Roles(UserRole.RECIPIENT, UserRole.HOSPITAL, UserRole.ADMIN)
    create(@Body() createRequestDto: any, @Request() req) {
        return this.requestsService.create({ ...createRequestDto, requesterId: req.user.userId });
    }

    @Get()
    findAll(@Query() query: any) {
        return this.requestsService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        const request = await this.requestsService.findOne(id);
        const user = req.user;

        // Privacy Check
        const isRequester = (request.requesterId as any)._id.toString() === user.userId;
        const isAssignedDonor = (request as any).assignedDonorId?.toString() === user.userId;
        const isAdmin = user.role === 'admin';

        if (!isRequester && !isAssignedDonor && !isAdmin) {
            // Mask sensitive info
            if (request.requesterId) {
                (request.requesterId as any).email = null; // or undefined
                (request.requesterId as any).phone = null;
            }
        }
        return request;
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateRequestDto: any) {
        return this.requestsService.update(id, updateRequestDto);
    }

    @Patch(':id/accept')
    @Roles(UserRole.DONOR)
    accept(@Param('id') id: string, @Request() req) {
        return this.requestsService.accept(id, req.user.userId);
    }

    @Patch(':id/approve')
    @Roles(UserRole.HOSPITAL)
    approve(@Param('id') id: string, @Request() req) {
        return this.requestsService.approveRequest(id, req.user.userId);
    }

    @Patch(':id/reject')
    @Roles(UserRole.HOSPITAL)
    reject(@Param('id') id: string, @Request() req) {
        return this.requestsService.rejectRequest(id, req.user.userId);
    }

    @Patch(':id/complete')
    @Roles(UserRole.HOSPITAL)
    complete(@Param('id') id: string, @Request() req) {
        return this.requestsService.completeRequest(id, req.user.userId);
    }

    @Patch(':id/assign-donor')
    @Roles(UserRole.HOSPITAL)
    assignDonor(@Param('id') id: string, @Body('donorId') donorId: string, @Request() req) {
        return this.requestsService.assignDonor(id, donorId, req.user.userId);
    }
}
