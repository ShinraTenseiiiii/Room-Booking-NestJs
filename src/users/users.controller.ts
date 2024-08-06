import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Request } from '@nestjs/common';
  import { CreateUserDto } from '../dto/createUser.dto';
  import { UsersService } from './users.service';
  import { LoginDto } from '../dto/login.dto';
  import { ExpressRequest } from '../middlewares/auth.middleware';
  import { ApplyForDto,ScheduledMeetingDto,UsersResponseDto } from '../dto/usersResponce.dto';
  import { UsersEntity } from './entities/user.entity';
  
  @Controller('users')
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    @Post()
    async createUser(
      @Body() createUserDto: CreateUserDto,
    ): Promise<UsersResponseDto> {
      const user = await this.usersService.createUser(createUserDto);
  
      return this.usersService.buildUserResponse(user);
    }
  
    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<UsersResponseDto> {
      const user = await this.usersService.loginUser(loginDto);
  
      return this.usersService.buildUserResponse(user);
    }
  
    @Get()
    async currentUser(
      @Request() request: ExpressRequest,
    ): Promise<UsersResponseDto> {
      if (!request.user) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
  
      return this.usersService.buildUserResponse(request.user);
    }
  
    @Post('applyFor')
    async applyFor(
      @Request() request: ExpressRequest,
      @Body() applyForDto: ApplyForDto,
    ): Promise<UsersResponseDto> {
      if (!request.user) {
        throw new HttpException('Unauthorizedd', HttpStatus.UNAUTHORIZED);
      }
  
  
      const user = await this.usersService.applyForJob(
        request.user.username,
        applyForDto,
      );
  
      return this.usersService.buildUserResponse(user);
    }
  
    @Post('schedule-meeting/:username/:jobId')
    async scheduleMeeting(
      @Param('jobId') jobId: string,
      @Param('username') username: string,
      @Body() scheduleMeetingDto: ScheduledMeetingDto,
    ): Promise<UsersResponseDto> {
      try {
        const updatedUser: UsersEntity = await this.usersService.scheduledMeeting(
          jobId,
          username,
          scheduleMeetingDto,
        );
  
        return this.usersService.buildUserResponse(updatedUser);
      } catch (error) {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
  
    @Post('update-application-status/:username/:role')
    async updateApplicationStatus(
      @Param('username') username: string,
      @Param('role') role: string,
      @Body() applyForDto: ApplyForDto,
    ): Promise<UsersResponseDto> {
      try {
        const updatedUser: UsersEntity = await this.usersService.updateApplicationStatus(
          username,
          role,
          applyForDto,
        );
  
        return this.usersService.buildUserResponse(updatedUser);
      } catch (error) {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get('all-users')
    async getAllUsers(@Request() request: ExpressRequest) {
      if (!request.user) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
    
      try {
        const users = await this.usersService.getAllUsersDetails();
        return users;
      } catch (error) {
        throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }