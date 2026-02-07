import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { ProfilesController } from './profiles.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { DonorProfile, DonorProfileSchema } from './schemas/donor-profile.schema';
import { HospitalProfile, HospitalProfileSchema } from './schemas/hospital-profile.schema';
import { RecipientProfile, RecipientProfileSchema } from './schemas/recipient-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: DonorProfile.name, schema: DonorProfileSchema },
      { name: HospitalProfile.name, schema: HospitalProfileSchema },
      { name: RecipientProfile.name, schema: RecipientProfileSchema },
    ]),
  ],
  controllers: [UsersController, ProfilesController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule { }
// Updated schema registration
