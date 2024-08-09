import { Controller, Post, Get, Body, Query, UsePipes } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { ParseDatePipe } from '../pipes/parse-date.pipe';
import { ApiTags } from '@nestjs/swagger';

@Controller('rooms')
@ApiTags('Rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('create') // admin only
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.createRoom(createRoomDto);
  }




  @Get("available-rooms")
  async findAvailableRooms(){
    return this.roomsService.findAvailableRooms();
  }

  // @Post('book-seat') // TODO will book seat in the bokings service not rooms service
  // async bookSeat(@Body() bookSeatDto: BookSeatDto) {
  //   return this.roomsService.bookSeat(bookSeatDto);
  // }   
}

// cancle seat