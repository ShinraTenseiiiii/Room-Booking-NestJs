import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UsersResponseDto {

  @IsString()
  readonly id: string;

  @IsString()
  readonly username: string;

  @IsString()
  readonly email: string;
 @IsNumber()
 readonly userType: number;

  @IsString()
  readonly token: string;

  @IsBoolean({ always: true })
  readonly isActive: boolean;

  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplyForDto)
  readonly applyFor: ApplyForDto[];
}

export class ApplyForDto {


  @IsString()
  phoneNumber: string;

  @IsString()
  qualification: string;

  @IsString()
  role: string;

  @IsString()
  applicationStatus: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduledMeetingDto)
  readonly scheduledMeeting: ScheduledMeetingDto[];
}

export class ScheduledMeetingDto {
  @IsString()
  scheduledTime: string;

  @IsString()
  meetingLink: string;
}