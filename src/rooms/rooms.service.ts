import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { BookSeatDto } from './dto/book-seat.dto';
import { availableMemory } from 'process';

@Injectable()
export class RoomsService {
  constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    const { roomNumber } = createRoomDto;

    // Check if the room already exists
    const existingRoom = await this.roomModel.findOne({ roomNumber }).exec();
    if (existingRoom) {
      throw new BadRequestException('Room with this number already exists');
    }

    // Create a new room
    const createdRoom = new this.roomModel(createRoomDto);
    return createdRoom.save();
  }

  async findAvailableSeats(roomNumber: string, date: Date): Promise<{ availableSeats: number }> {
    const room = await this.roomModel.findOne({ roomNumber }).exec();
    if (!room) {
      throw new NotFoundException('Room not found');
    }
  
    // Check if seats are available for the given date
    if (room.bookedDates.includes(date)) {
      throw new BadRequestException('Seats are already booked for this date');
    }
  
    return { availableSeats: room.availableSeats };
  }



  async findAvailableRooms(): Promise<Room[]> {
    return this.roomModel.find().exec();
  }
  
  
  
  
  async bookSeat(bookSeatDto: BookSeatDto): Promise<Room> {
    const { roomNumber, date } = bookSeatDto;

    // Find the room
    const room = await this.roomModel.findOne({ roomNumber }).exec();

    if (!room) {
      throw new NotFoundException('Room not found');
    }



    // Check if the room is available on the given date
    if (room.bookedDates.includes(date)) {
      throw new BadRequestException('Seats are already booked for this date');
    }

    // Check if there are available seats
    if (room.availableSeats <= 0) {
      throw new BadRequestException('No available seats');
    }


    // Book the seat
    room.availableSeats -= 1;
    room.bookedDates.push(date);



    // Save the updated room
    return room.save();
  }
}
