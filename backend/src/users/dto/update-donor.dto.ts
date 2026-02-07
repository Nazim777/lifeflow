import { IsEnum, IsNumber, IsOptional, IsString, Max, Min, ValidateNested, IsBoolean, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDonorDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @Min(18)
    @Max(60)
    @IsOptional()
    age?: number;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsEnum(['Male', 'Female', 'Other'])
    @IsOptional()
    gender?: string;

    @IsString()
    @IsEnum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    @IsOptional()
    bloodGroup?: string;

    @IsNumber()
    @Min(45)
    @IsOptional()
    weight?: number;

    @IsOptional()
    @Type(() => LocationDto)
    @ValidateNested()
    location?: LocationDto;

    @IsBoolean()
    @IsOptional()
    availability?: boolean; // Availability Control

    @IsBoolean()
    @IsOptional()
    isVisible?: boolean; // Profile Visibility
}

class LocationDto {
    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsOptional()
    area?: string;
}


