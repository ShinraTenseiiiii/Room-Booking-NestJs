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
    type: String,
  })
  @IsNotEmpty()
  @IsMongoId()
  readonly roomId: string;

  @ApiProperty({
    type: Date,
    example: '2024-07-30',
  })
  @IsNotEmpty()
  @IsDateString()
  readonly bookingDate: Date;
}
