import { IsNotEmpty, IsString, IsNumber, Min, IsEnum, IsDateString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { RequestUrgency } from '../schemas/blood-request.schema';

class LocationDto {
    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    area: string;
}

export class CreateRequestDto {
    @IsNotEmpty()
    @IsString()
    patientName: string;

    @IsNotEmpty()
    @IsString()
    bloodGroup: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    units: number;

    @IsNotEmpty()
    @IsEnum(RequestUrgency)
    urgency: RequestUrgency;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;

    @IsNotEmpty()
    @IsDateString()
    requiredDate: string;

    @IsOptional()
    @IsString()
    hospitalId: string;
}
