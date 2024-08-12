import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
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


async getBookingDetailsForUser(userId: any ): Promise<any> {
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

  const limit = 7; // Number of entries per page

  const bookings = await this.bookingModel
    .find()
    .populate('roomId')
    .populate('userId')
    .sort({ bookingDate: -1 }) // sorting by bookingDate > des order
    .limit(limit)
    .exec();


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
async getRoomDetailsByDateAndRoomId(date: Date, roomId: string): Promise<any> {
  const bookings = await this.bookingModel
    .find({
      bookingDate: date,
      roomId: new mongoose.Types.ObjectId(roomId),
    })
    .exec();

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
    }
  }));

  return bookingDetails;
}








// by room id





async getRoomDetailsByRoomId(roomId: string): Promise<any> {
  try {
    
    const room = await this.roomModel.findById(roomId).exec();

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const availableSeatsByDate = {};
    for (const bookedDate of room.bookedDates) {
      const date = bookedDate.toDateString();
      if (!availableSeatsByDate[date]) {
        availableSeatsByDate[date] = room.capacity;
      }
      availableSeatsByDate[date] -= 1;
    }
// console.log(availableSeatsByDate);
// console.log(room.roomNumber);
// console.log(room.roomName);
// console.log(roomId);




    const roomDetails = [
{      roomId,
      roomName: room.roomName,
      capacity: room.capacity,
      roomNumber: room.roomNumber,
      availableSeatsByDate,}
    ]

// console.log(roomDetails);

    return roomDetails;

  } catch (error) {
    console.error('Error retrieving room details:', error);
    throw new InternalServerErrorException('An error occurred while retrieving room details.');
  }
}







// default fetxh
// Res : Room Number, Room Name, Booked Date, Booked By, Available Seats
async getAllRoomDetails(): Promise<any[]> {
  const bookings = await this.bookingModel
    .find()
    .populate('roomId')
    .populate('userId')
    .exec();

  const roomDetails = Object.values(
    bookings.reduce((acc, booking) => {
      const user = booking.userId;
      const roomId = booking.roomId;

      if (user && roomId) {
        const roomKey = `${roomId.roomName}-${roomId.roomNumber}`;

        if (!acc[roomKey]) {
          acc[roomKey] = {
            roomName: roomId.roomName,
            roomNumber: roomId.roomNumber,
            capacity: roomId.capacity,
            availableSeats: {},
          };
        }

        const availableSeatsByDate = acc[roomKey].availableSeats;
        const bookedDates = roomId.bookedDates;
        const totalSeats = roomId.capacity;

        bookedDates.forEach((bookedDate) => {
          const date = new Date(bookedDate);
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();
          const key = `${year}-${month}-${day}`;

          if (!availableSeatsByDate[key]) {
            availableSeatsByDate[key] = totalSeats - 1;
          }

          availableSeatsByDate[key]--;
        });
      }

      return acc;
    }, {})
  );

  return roomDetails;
}

}