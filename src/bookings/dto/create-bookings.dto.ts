// src/rooms/dto/book-seat.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsMongoId, IsDateString } from 'class-validator';

export class BookSeatDto {
  @ApiProperty({
    description: 'ID of the user who is booking the seat',
    type: String,
  })
  @IsNotEmpty()
  @IsMongoId()
  readonly userId: string;

  @ApiProperty({
    description: 'ID of the room being booked',
    type: String,
  })
  @IsNotEmpty()
  @IsMongoId()
  readonly roomId: string;

  @ApiProperty({
    description: 'Date for which the seat is being booked',
    type: String,
    example: '2024-07-30T00:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  readonly bookingDate: Date;
}
