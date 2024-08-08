import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from './entities/booking.entity';
import { Room } from 'src/rooms/entities/room.entity';
import { UsersEntity } from 'src/users/entities/user.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Room.name) private roomModel: Model<Room>,
    @InjectModel(UsersEntity.name) private userModel: Model<UsersEntity>,
  ) {}

  async bookSeat(userId: string, roomId: string, bookingDate: Date): Promise<any> {
    // Check if room exists
    const room = await this.roomModel.findById(roomId).exec();
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user exists
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has already booked this room on the same date
    const existingBooking = await this.bookingModel.findOne({
      userId,
      roomId,
      bookingDate,
    }).exec();

    if (existingBooking) {
      throw new BadRequestException('User has already booked this room on the given date');
    }

    // Check if the user has another booking on the same date
    const userBookingsOnDate = await this.bookingModel.find({
      userId,
      bookingDate,
    }).exec();
    if (userBookingsOnDate.length > 0) {
      throw new BadRequestException('User has another booking on the same date');
    }

    // Check if the number of bookings for this room on the date exceeds its capacity
    const roomBookingsOnDate = await this.bookingModel.find({
      roomId,
      bookingDate,
    }).exec();
    if (roomBookingsOnDate.length >= room.capacity) {
      throw new BadRequestException('Room capacity exceeded for the given date');
    }

    // Create a new booking
    const booking = await this.bookingModel.create({
      userId,
      roomId,
      bookingDate,
    });

    return {
      
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
      },
      room: {
        id: room._id,
        number: room.roomNumber,
      },
      bookingDate: booking.bookingDate,
      bookingId: booking._id,
    };
  }
}