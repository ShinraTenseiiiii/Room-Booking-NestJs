import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from './entities/booking.entity';
import { Room } from 'src/rooms/entities/room.entity';
import { UsersEntity } from 'src/users/entities/user.entity';
import { log } from 'util';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Room.name) private roomModel: Model<Room>,
    @InjectModel(UsersEntity.name) private userModel: Model<UsersEntity>,
  ) {}
  async checkAvailability(roomId: string, bookingDate: Date): Promise<{ roomId: string; bookingDate: Date; availability: boolean }> {
    const room = await this.roomModel.findById(roomId).exec();
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const roomBookingsOnDate = await this.bookingModel.find({
      roomId,
      bookingDate,
    }).exec();

    const availability = roomBookingsOnDate.length < room.capacity;

    return { roomId, bookingDate, availability };
  }
  
  
  
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
      throw new BadRequestException('User has already booked this room on the date');
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
      throw new BadRequestException('Room capacity exceeded for the date');
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


// booking details (For user)
async getBookingDetailsForUser(userId: string): Promise<any> {
  const bookings = await this.bookingModel
    .find({ userId })
    .populate('roomId')
    .exec();

  const bookingDetails = bookings.map((booking) => ({
    roomName: booking.roomId.roomName,
    roomNumber: booking.roomId.roomNumber,
    bookedDate: booking.bookingDate,
  }));

  return bookingDetails;
}
// for admin 
async getAllBookingDetails(): Promise<any> {
  const bookings = await this.bookingModel
    .find()
    .populate('roomId')
    .populate('userId')
    .exec();
//console.log(bookings);

  const bookingDetails = await Promise.all(bookings.map(async (booking) => {
    const user = await this.userModel.findById(booking.userId).exec();
    console.log(user);
    
    if(user){
    return {
      roomName: booking.roomId.roomName,
      roomNumber: booking.roomId.roomNumber,
      bookedDate: booking.bookingDate,
      bookedBy: user.username,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  }
  }));

  return bookingDetails;
}

// get room details 

//by date and room id
// async getRoomDetailsByDateAndRoomId(date: Date, roomId: string): Promise<any> { 
//   const room = await this.roomModel.findById(roomId).exec();
//   if (!room) {
//     throw new NotFoundException(`Room with ID ${roomId} not found`);
//   }

//   const roomBookings = await this.bookingModel
//     .find({ roomId: room._id, bookingDate: date })
//     .populate('userId')
//     .exec();

//   const roomDetails = {
//     roomName: room.roomName,
//     roomNumber: room.roomNumber,
//     availableSeats: room.capacity - roomBookings.length,
//     booking: roomBookings.map((booking) => ({
//       userDetails: {
//         username: booking.userId.username,
//         email: booking.userId.email,
//       },
//       bookingDate: booking.bookingDate,
//       bookingId: booking._id,
//     })),
//   };

//   return roomDetails;
// }

// // by room id
// async getRoomDetailsByRoomId(roomId: string): Promise<any> {
//   const room = await this.roomModel.findById(roomId).exec();
//   if (!room) {
//     throw new NotFoundException(`Room with ID ${roomId} not found`);
//   }

//   const roomBookings = await this.bookingModel
//     .find({ roomId: room._id })
//     .populate('userId')
//     .exec();

//   const roomDetails = {
//     roomName: room.roomName,
//     roomNumber: room.roomNumber,
//     bookings: roomBookings.reduce((acc, booking) => {
//       const date = booking.bookingDate.toISOString().split('T')[0];
//       if (!acc[date]) {
//         acc[date] = [];
//       }
//       acc[date].push({
//         userDetails: {
//           username: booking.userId.username,
//           email: booking.userId.email,
//         },
//         bookingId: booking._id,
//       });
//       return acc;
//     }, {}),
//   };

//   return roomDetails;
// }

// default fetxh
async getAllRoomDetails(): Promise<any[]> {
  const rooms = await this.roomModel.find().exec();
  const user = await this.userModel.find().exec();
  const roomDetails = await Promise.all(
      rooms.map(async (room) => {
          const roomBookings = await this.bookingModel
              .find({ roomId: room._id })
              .populate('userId')
              .exec();

          const userDetails = await Promise.all(
              roomBookings.map(async (booking) => {
                  const user = await this.userModel.findById(booking.userId._id).exec();
                  return {
                      username: user.username,
                      email: user.email,
                  };
              })
          );

          return {
              roomName: room.roomName,
              roomNumber: room.roomNumber,
              availableSeats: room.capacity - roomBookings.length,
              booking: roomBookings.map((booking, index) => ({
                  userDetails: userDetails[index],
                  bookingDate: booking.bookingDate,
                  bookingId: booking._id,
              })),
          };
      })
  );

  return roomDetails;
}


}