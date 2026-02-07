import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './users/schemas/user.schema';

async function bootstrap() {
    console.log('🌱 Starting Seed Script...');
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);

    const adminEmail = 'admin@blood.com';
    const existingAdmin = await usersService.findOneByEmail(adminEmail);

    if (existingAdmin) {
        console.log('✅ Admin user already exists. Skipping...');
    } else {
        console.log('🚀 Creating Admin user...');
        await usersService.create({
            email: adminEmail,
            name: 'System Admin',
            password: 'admin123', // Will be hashed by service
            role: UserRole.ADMIN,
        });

        // Admins are verified by default? 
        // Service sets isVerified: false by default. We need to manually update it.
        const admin = await usersService.findOneByEmail(adminEmail);
        if (admin) {
            // Bypass service method if needed or add verifyAdmin method. 
            // Reuse verifyUser since it just flips the flag.
            await usersService.verifyUser((admin as any)._id.toString());
            console.log('✅ Admin user created and verified!');
        }
    }

    await app.close();
    console.log('🌱 Seed Script Completed.');
}

bootstrap();
