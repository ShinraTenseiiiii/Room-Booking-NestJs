import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
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

  // async findAvailableSeats(roomNumber: string, date: Date): Promise<{ availableSeats: number }> {  // TODO DOIN IT IN BOOKINGS
  //   const room = await this.roomModel.findOne({ roomNumber }).exec();
  //   if (!room) {
  //     throw new NotFoundException('Room not found');
  //   }
  
  //   // Check if seats are available for the given date
  //   if (room.bookedDates.includes(date)) {
  //     throw new BadRequestException('Seats are already booked for this date');
  //   }
  
  //   return { availableSeats: room.availableSeats };
  // }



  async findAvailableRooms(): Promise<Room[]> {
    return this.roomModel.find().exec();
  }
  
  
  

}
