import { Controller, Post, Get, Body, Query, UsePipes } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { BookSeatDto } from './dto/book-seat.dto';
import { ParseDatePipe } from '../pipes/parse-date.pipe';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('create') // admin only
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.createRoom(createRoomDto);
  }

  @Get('available-seats')
  async findAvailableSeats(@Query('roomNumber') roomNumber: string, @Query('date', ParseDatePipe) date: Date) {
    return this.roomsService.findAvailableSeats(roomNumber, date );
  }



  @Get("available-rooms")
  async findAvailableRooms(){
    return this.roomsService.findAvailableRooms();
  }

  @Post('book-seat')
  async bookSeat(@Body() bookSeatDto: BookSeatDto) {
    return this.roomsService.bookSeat(bookSeatDto);
  }
}

// cancle seat