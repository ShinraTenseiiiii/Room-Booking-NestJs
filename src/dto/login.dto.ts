import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {

  @ApiProperty({ required: true})
  readonly email: string;
  
  @ApiProperty({ required: true})
  readonly password: string;
}
