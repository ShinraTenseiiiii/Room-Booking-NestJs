// src/bookings/bookings.controller.ts
import { Controller,Get, Query, Post, Body, BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';

import { Booking } from './entities/booking.entity';
import { BookSeatDto } from './dto/create-bookings.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('bookings')
@ApiTags('Contest')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}


  @Get('availability')
  async checkAvailability(@Query('roomId') roomId: string, @Query('bookingDate') bookingDate: Date) {
    return this.bookingsService.checkAvailability(roomId, bookingDate);
  }
  

  @Post('book-seat')
  async bookSeat(@Body() bookSeatDto: BookSeatDto): Promise<Booking> {
    const { userId, roomId, bookingDate } = bookSeatDto;

    // Check if the booking can be processed
    try {
      return await this.bookingsService.bookSeat(userId, roomId, bookingDate);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error processing booking');
    }
  }
 

  @Get('booking-details')
  async getBookingDetails(@Query('userId') userId?: string): Promise<any> {
    if (userId) {
      return this.bookingsService.getBookingDetailsForUser(userId);
    } else {
      return this.bookingsService.getAllBookingDetails();
    }
  }

  @Get('room-details')
  async getRoomDetails(@Query('date') date?: Date, @Query('roomId') roomId?: string): Promise<any> {
    if (date && roomId) {
      return this.bookingsService.getRoomDetailsByDateAndRoomId(date, roomId);
    } else {
      return this.bookingsService.getAllRoomDetails();
    }
  }
  

}
