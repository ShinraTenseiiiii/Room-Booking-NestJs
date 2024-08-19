import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { Booking } from './entities/booking.entity';
import { Room } from 'src/rooms/entities/room.entity';
import { UsersEntity } from 'src/users/entities/user.entity';
import { Query } from 'express-serve-static-core';
import { populate } from 'dotenv';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Room.name) private roomModel: Model<Room>,
    @InjectModel(UsersEntity.name) private userModel: Model<UsersEntity>,
  ) {}






  async checkAvailability(roomId: string, bookingDate: Date): Promise<{
    roomId: string;
    bookingDate: Date;
    availability: boolean;
    totalCapacity: number;
    bookedSeats: number;
    availableSeats: number;
  }> {
    const room = await this.roomModel.findById(roomId).exec();
    if (!room) {
      throw new NotFoundException('Room not found');
    }
  
    const roomBookingsOnDate = await this.bookingModel.find({
      roomId,
      bookingDate,
    }).exec();
  
    const totalCapacity = room.capacity;
    const bookedSeats = roomBookingsOnDate.length;
    const availableSeats = totalCapacity - bookedSeats;
    const availability = availableSeats > 0;
  
    return {
      roomId,
      bookingDate,
      availability,
      totalCapacity,
      bookedSeats,
      availableSeats,
    };
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


async getBookingDetailsForUser(userId: any ): Promise<{ pastBookings: any[], upcomingBookings: any[] }> {
  const bookings = await this.bookingModel
    .find({ userId })
    .populate('roomId')
    .exec();

    

  const now = new Date();
  const pastBookings = bookings.filter((booking) => new Date(booking.bookingDate) < now);
  const upcomingBookings = bookings.filter((booking) => new Date(booking.bookingDate) >= now);

  const pastBookingDetails = pastBookings.map((booking) => ({
    roomName: booking.roomId.roomName,
    roomNumber: booking.roomId.roomNumber,
    bookedDate: booking.bookingDate,
    bookingId: booking._id,

  }));

  const upcomingBookingDetails = upcomingBookings.map((booking) => ({
    roomName: booking.roomId.roomName,
    roomNumber: booking.roomId.roomNumber,
    bookedDate: booking.bookingDate,
    bookingId: booking._id,
  }));

  return { pastBookings: pastBookingDetails, upcomingBookings: upcomingBookingDetails };
}






// for admin 
async getAllBookingDetails(query: Query): Promise<any> {
  console.log(query);

  const resPerPage = 5;
  const currentPage = Number(query.page) || 1;
  const skip = resPerPage * (currentPage - 1);

  const bookings = await this.bookingModel
    .find()
    .populate('roomId')
    .populate('userId')
    .sort({ bookingDate: 1})
    .skip(skip)
    .limit(resPerPage)
    .exec();
    const totalBookings = await this.bookingModel.countDocuments().exec();

  const bookingDetails = await Promise.all(bookings.map(async (booking) => {
    const user = await this.userModel.findById(booking.userId).exec();

    if (user) {
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
    } else {
      throw new Error(`User not found for booking ${booking._id}`);
    }
  }));

  return {bookingDetails, totalBookings};
}















// get room details 

//by date and room id
async getRoomDetailsByDateAndRoomId(date: Date, roomId: string): Promise<any> {
  const bookings = await this.bookingModel
    .find({
      bookingDate: date,
      roomId: new mongoose.Types.ObjectId(roomId),
    })
    .populate('roomId')
    .exec();

  if (bookings.length > 0) {
    const room = bookings[0].roomId;
    const bookedUsers = await Promise.all(bookings.map(async (booking) => {
      const user = await this.userModel.findById(booking.userId).exec();
      return {
        id: user._id,
        name: user.username,
        email: user.email,
      };
    }));

    return {
      roomNumber: room.roomNumber,
      roomName: room.roomName,
      totalCapacity: room.capacity,
      bookedUsers,
    };
  }

  return null; // or throw an error if no booking is found
}








// by room id

async getRoomDetailsByRoomId(roomId: string): Promise<any[]> {
  const room = await this.roomModel.findById(roomId).exec();

  if (!room) {
    throw new NotFoundException('Room not found');
  }

  const bookedDates = await this.bookingModel.find({ roomId: room._id }).exec();
  const totalSeats = room.capacity;
  const availableSeatsByDate = {};

  bookedDates.forEach((bookedDate) => {
    const dateKey = `${bookedDate.bookingDate.getFullYear()}-${bookedDate.bookingDate.getMonth() + 1}-${bookedDate.bookingDate.getDate()}`;
    if (!availableSeatsByDate[dateKey]) {
      availableSeatsByDate[dateKey] = totalSeats;
    }
    availableSeatsByDate[dateKey]--;
  });

  return [
    {
      roomId: room._id,
      roomName: room.roomName,
      capacity: room.capacity,
      roomNumber: room.roomNumber,
      availableSeats: availableSeatsByDate,
    },
  ];
}







// default fetxh by ngOnInit
// Res : Room Number, Room Name, Booked Date, Booked By, Available Seats[date:available_seats]
async getAllRoomDetails(): Promise<any[]> {
  const rooms = await this.roomModel.find().exec();

  const roomDetails = await Promise.all(
    rooms.map(async (room) => {
      const bookedDates = await this.bookingModel.find({ roomId: room._id }).exec();
      const totalSeats = room.capacity;
      const availableSeatsByDate = {};

      bookedDates.forEach((bookedDate) => {
        const dateKey = `${bookedDate.bookingDate.getFullYear()}-${bookedDate.bookingDate.getMonth() + 1}-${bookedDate.bookingDate.getDate()}`;
        if (!availableSeatsByDate[dateKey]) {
          availableSeatsByDate[dateKey] = totalSeats;
        }
        availableSeatsByDate[dateKey]--;
      });

      return {
        roomId: room._id,
        roomName: room.roomName,
        capacity: room.capacity,
        roomNumber: room.roomNumber,
        availableSeats: availableSeatsByDate,
      };
    })
  );

  return roomDetails;
}




}