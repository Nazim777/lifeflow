import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inventory, InventoryDocument } from './schemas/inventory.schema';

@Injectable()
export class InventoryService {
    constructor(
        @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    ) { }

    async create(createInventoryDto: any): Promise<Inventory> {
        // Check for verification? Done in controller.
        const createdItem = new this.inventoryModel(createInventoryDto);
        return createdItem.save();
    }

    async findAll(hospitalId?: string): Promise<Inventory[]> {
        const query = hospitalId ? { hospitalId } : {};
        // Return all batches? Or aggregated?
        // Frontend likely wants Batches for management, and Aggregated for Dashboard.
        // Let's return Batches here, frontend can aggregate.
        return this.inventoryModel.find(query).populate('hospitalId', 'institutionName').sort({ expiryDate: 1 }).exec();
    }

    async getAggregatedInventory(hospitalId: string) {
        return this.inventoryModel.aggregate([
            { $match: { hospitalId: new Types.ObjectId(hospitalId) } },
            { $group: { _id: "$bloodGroup", totalUnits: { $sum: "$units" } } },
            { $project: { bloodGroup: "$_id", totalUnits: 1, _id: 0 } }
        ]).exec();
    }

    async getPublicInventory(hospitalId: string) {
        const inventory = await this.getAggregatedInventory(hospitalId);
        return inventory.map(item => {
            let status = 'Available';
            if (item.totalUnits === 0) status = 'Out of Stock';
            else if (item.totalUnits < 5) status = 'Low';

            return {
                bloodGroup: item.bloodGroup,
                status // Hide exact units
            };
        });
    }

    async update(id: string, updateInventoryDto: any): Promise<Inventory> {
        const updatedItem = await this.inventoryModel
            .findByIdAndUpdate(id, updateInventoryDto, { new: true })
            .exec();
        if (!updatedItem) {
            throw new NotFoundException(`Inventory item with ID ${id} not found`);
        }
        return updatedItem;
    }

    async delete(id: string): Promise<void> {
        const result = await this.inventoryModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Inventory item with ID ${id} not found`);
        }
    }

    // New: Decrement Stock (FIFO)
    async decrementStock(hospitalId: string, bloodGroup: string, unitsToDeduct: number) {
        let remaining = unitsToDeduct;

        // Get batches sorted by expiry (Oldest first)
        // Also Filter out expired? Or use them first (and mark as waste)?
        // Better: Use valid batches first.
        const batches = await this.inventoryModel.find({
            hospitalId,
            bloodGroup,
            expiryDate: { $gt: new Date() }, // Not expired
            units: { $gt: 0 }
        }).sort({ expiryDate: 1 }).exec();

        for (const batch of batches) {
            if (remaining <= 0) break;

            if (batch.units >= remaining) {
                batch.units -= remaining;
                remaining = 0;
            } else {
                remaining -= batch.units;
                batch.units = 0;
            }
            await batch.save();
        }

        if (remaining > 0) {
            throw new Error(`Insufficient stock for ${bloodGroup}. Missing ${remaining} units.`);
        }
    }
}
