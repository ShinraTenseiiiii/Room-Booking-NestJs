import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking, BookingSchema } from './entities/booking.entity';
import { UsersEntity, UsersEntitySchema } from '../users/entities/user.entity';
import { Room, RoomSchema } from '../rooms/entities/room.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: UsersEntity.name, schema: UsersEntitySchema },
      { name: Room.name, schema: RoomSchema },
    ]),
  ],
  providers: [BookingsService],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
