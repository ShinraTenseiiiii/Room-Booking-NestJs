// src/bookings/bookings.controller.ts
import { Controller, Post, Body, BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';

import { Booking } from './entities/booking.entity';
import { BookSeatDto } from './dto/create-bookings.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

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
}
