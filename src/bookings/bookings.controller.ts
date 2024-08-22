// src/bookings/bookings.controller.ts
import { Controller, Req ,Get, Query, Post, Body, BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { BookSeatDto } from './dto/create-bookings.dto';
import { ApiTags } from '@nestjs/swagger';
import { ExpressRequest } from '../middlewares/auth.middleware';
import { Query as ExpressQuery } from 'express-serve-static-core'
@Controller('bookings')
@ApiTags('Bookings')
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
  async getBookingDetails( @Req() req: ExpressRequest, @Query() query: ExpressQuery): Promise<any> {
    const userType = req.user?.usersType;
    const userId = req.user?._id;

    const pastPage = Number(query.pastPage) || 1;
    const upcomingPage = Number(query.upcomingPage) || 1;

    if (userType === 2) {
      return this.bookingsService.getBookingDetailsForUser(userId, pastPage, upcomingPage);
    } else if (userType === 1) {
      return this.bookingsService.getAllBookingDetails(query);
    }
  }

// for dipanjan
  @Get('booking-details-mob')
  async getBookingDetailsForMobile(
    @Req() req: ExpressRequest
  ): Promise<any> {
    const userType = req.user?.usersType;
    const userId = req.user?._id;

    if (userType === 2) {
      return this.bookingsService.getBookingDetailsForUserWithoutPagination(userId);
    } else {
      throw new BadRequestException('This endpoint is only for users');
    }
  }


  @Get('room-details')
  async getRoomDetails(@Query('date') date?: Date, @Query('roomId') roomId?: string): Promise<any> {
    if (date && roomId) {
      
     return this.bookingsService.getRoomDetailsByDateAndRoomId(date, roomId);

    }
    else if(roomId) {
   
     return this.bookingsService.getRoomDetailsByRoomId(roomId);
     
    }
    else {
     return this.bookingsService.getAllRoomDetails();
    }
  }
  

}
