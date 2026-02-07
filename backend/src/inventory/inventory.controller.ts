import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Post()
    @Roles(UserRole.HOSPITAL)
    create(@Body() createInventoryDto: any, @Request() req) {
        return this.inventoryService.create({ ...createInventoryDto, hospitalId: req.user.userId });
    }

    @Get()
    @Roles(UserRole.HOSPITAL)
    findAll(@Request() req) {
        return this.inventoryService.findAll(req.user.userId);
    }

    @Get('aggregated')
    @Roles(UserRole.HOSPITAL)
    findAggregated(@Request() req) {
        return this.inventoryService.getAggregatedInventory(req.user.userId);
    }

    @Get('public/:hospitalId')
    @Roles(UserRole.RECIPIENT, UserRole.DONOR, UserRole.ADMIN, UserRole.HOSPITAL)
    getPublicInventory(@Param('hospitalId') hospitalId: string) {
        return this.inventoryService.getPublicInventory(hospitalId);
    }

    @Patch(':id')
    @Roles(UserRole.HOSPITAL)
    update(@Param('id') id: string, @Body() updateInventoryDto: any) {
        return this.inventoryService.update(id, updateInventoryDto);
    }

    @Delete(':id')
    @Roles(UserRole.HOSPITAL)
    remove(@Param('id') id: string) {
        return this.inventoryService.delete(id);
    }
}
