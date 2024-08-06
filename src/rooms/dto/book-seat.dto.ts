import { IsString, IsDateString } from 'class-validator';

export class BookSeatDto {
  @IsString()
  readonly roomNumber: string;

  @IsDateString()
  readonly date: Date;
}
