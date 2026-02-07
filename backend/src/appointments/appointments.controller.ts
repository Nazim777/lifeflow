import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'))
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) { }

    @Post()
    create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
        return this.appointmentsService.create(createAppointmentDto, req.user.userId);
    }

    @Get()
    findAll(@Request() req) {
        return this.appointmentsService.findAll(req.user.userId, req.user.role);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: string, @Request() req) {
        return this.appointmentsService.updateStatus(id, status, req.user.userId);
    }
}
