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
async getRoomDetailsByDateAndRoomId(date: Date, roomId: string): Promise<any> { 
  const room = await this.roomModel.findById(roomId).exec();
  if (!room) {
    throw new NotFoundException(`Room with ID ${roomId} not found`);
  }

  const roomBookings = await this.bookingModel
    .find({ roomId: room._id, bookingDate: date })
    .populate('userId')
    .exec();

  const roomDetails = {
    // 
  };

  return roomDetails;
}









// by room id
// async getRoomDetailsByRoomId(roomId: string): Promise<any> {
//   const rooms = await this.roomModel.find().exec();

//   const roomDetails = await Promise.all(rooms.map(async (room) => {
//     if (room.roomNumber === roomId) {
//       const bookedDates = room.bookedDates; // Assuming bookedDates is an array of dates
//       const totalSeats = room.capacity; // Assuming capacity is the total number of seats

//       // Initialize available seats for all dates to total seats
//       const availableSeatsByDate: Record<string, number> = {};
//       bookedDates.forEach((bookedDate) => {
//         const date = new Date(bookedDate);
//         const year = date.getFullYear();
//         const month = date.getMonth();
//         const day = date.getDate();
//         const key = `${year}-${month}-${day}`;

//         availableSeatsByDate[key] = totalSeats;
//       });

//       // Set available seats to 0 for booked dates
//       bookedDates.forEach((bookedDate) => {
//         const date = new Date(bookedDate);
//         const year = date.getFullYear();
//         const month = date.getMonth();
//         const day = date.getDate();
//         const key = `${year}-${month}-${day}`;

//         availableSeatsByDate[key] = 0;
//       });

//       // Check if any date has available seats
//       const hasAvailableSeats = Object.values(availableSeatsByDate).some((value) => value > 0);

//       return {
//         roomNumber: room.roomNumber,
//         roomName: room.roomName,
//         bookedDates: bookedDates.map((date) => new Date(date).toISOString()),
//         availableSeats: hasAvailableSeats ? availableSeatsByDate : 'Available',
//       };
//     }
//   }));


//   // Filter the results by roomId
//   const filteredRoomDetails = roomDetails.find((room) => room !== undefined);

//   return filteredRoomDetails;
// }









// default fetxh
// Res : Room Number, Room Name, Booked Date, Booked By, Available Seats
async getAllRoomDetails(): Promise<any[]> {
  const bookings = await this.bookingModel
    .find()
    .populate('roomId')
    .populate('userId')
    .exec();

  const roomDetails = await Promise.all(bookings.map(async (booking) => {
    const user = await this.userModel.findById(booking.userId).exec();

    if (user) {
      const roomId = booking.roomId;
      const bookedDates = roomId.bookedDates;
      const totalSeats = roomId.capacity;

      //available seats for each date
      const availableSeatsByDate = {};
      bookedDates.forEach((bookedDate) => {
        const date = new Date(bookedDate);
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const key = `${year}-${month}-${day}`;

        if (!availableSeatsByDate[key]) {
          availableSeatsByDate[key] = totalSeats-1;
        }

        availableSeatsByDate[key]--;
      });

      return {
        roomName: roomId.roomName,
        roomNumber: roomId.roomNumber,
        capaciy: roomId.capacity,
        availableSeats: availableSeatsByDate,

      };
    }

    return null; // or handle the case when user is not found
  }));

  return roomDetails.filter(Boolean); // Remove null values
}

}