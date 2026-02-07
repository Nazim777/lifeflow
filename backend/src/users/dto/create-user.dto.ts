import { IsEmail, IsEnum, IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole = UserRole.DONOR;
}
