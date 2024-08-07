import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  
  @ApiProperty({ description: 'The username of the user'})
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({ description: 'The email address of the user'})
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ description: 'The password for the user account'})
  @IsNotEmpty()
  readonly password: string;
}
