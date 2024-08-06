import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
    InternalServerErrorException
  } from '@nestjs/common';
  import { CreateUserDto } from '../dto/createUser.dto';
  import { InjectModel } from '@nestjs/mongoose';
  import { UsersEntity } from './entities/user.entity';
  import { Model } from 'mongoose';
  import { LoginDto } from '../dto/login.dto';
  import { compare } from 'bcrypt';
  import { sign } from 'jsonwebtoken';
  import {
    ApplyForDto,
    ScheduledMeetingDto,
    UsersResponseDto,
  } from '../dto/usersResponce.dto';
  import { JobEntity } from './entities/job.entity';
  import { Types } from 'mongoose';
  
  @Injectable()
  export class UsersService {
    constructor(
      @InjectModel(UsersEntity.name) private usersModel: Model<UsersEntity>,
      @InjectModel(JobEntity.name) private jobModel: Model<JobEntity>,
    ) {}

    async buildUserResponse(usersEntity: UsersEntity): Promise<UsersResponseDto> {
      const jobIds = usersEntity.applyFor as Types.ObjectId[];
  
      if (!jobIds || jobIds.length === 0) {
        return {
          username: usersEntity.username,
          email: usersEntity.email,
          userType: usersEntity.usersType,
          applyFor: [],
          token: this.generateJwt(usersEntity),
        };
      }
  
      const jobEntities = await this.jobModel.find({ _id: { $in: jobIds } });
  
      if (!jobEntities || jobEntities.length === 0) {
        return {
          username: usersEntity.username,
          email: usersEntity.email,
          userType: usersEntity.usersType,
          applyFor: [],
          token: this.generateJwt(usersEntity),
        };
      }
  
      const applyForDtos: ApplyForDto[] = jobEntities.map((job) => {
        const scheduledMeetingDtos = job.scheduledMeeting.map((meeting) => ({
          scheduledTime: meeting.scheduledTime,
          meetingLink: meeting.meetingLink,
        }));
  
        return {
          phoneNumber: job.phoneNumber,
          qualification: job.qualification,
          role: job.role,
          applicationStatus: job.applicationStatus,
          scheduledMeeting: scheduledMeetingDtos,
        };
      });
  
      return {
        username: usersEntity.username,
        email: usersEntity.email,
        userType: usersEntity.usersType,
        applyFor: applyForDtos,
        token: this.generateJwt(usersEntity),
      };
    }
  











    generateJwt(usersEntity: UsersEntity): string {
      return sign({ email: usersEntity.email }, 'JWT_SECRET');
    }
  
    async findByEmail(email: string): Promise<UsersEntity> {
      return this.usersModel.findOne({ email });
    }
  
    async createUser(createUserDto: CreateUserDto): Promise<UsersEntity> {
      const user = await this.usersModel.findOne({ email: createUserDto.email });
  
      if (user) {
        throw new HttpException(
          'Email is already taken',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
  
      const createdUser = new this.usersModel(createUserDto);
      return createdUser.save();
    }
  
    async loginUser(loginDto: LoginDto): Promise<UsersEntity> {
      const user = await this.usersModel
        .findOne({ email: loginDto.email })
        .select('+password');
  
      if (!user) {
        throw new HttpException(
          'User is not found!',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
  
      const isPasswordCorrect = await compare(loginDto.password, user.password);
  
      if (!isPasswordCorrect) {
        throw new HttpException(
          'Invalid Password!',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
  
      return user;
    }
  
    async applyForJob(
      username: string,
      applyForDto: ApplyForDto,
    ): Promise<UsersEntity> {
      console.log("applyForDto",applyForDto);
      
      const user = await this.usersModel.findOne({ username });
      if (!user) {
        throw new NotFoundException('User not found!');
      }
  
      const appliedForJob = new this.jobModel({
        ...applyForDto,
      });
  
      await appliedForJob.save();
  
      user.applyFor.push(appliedForJob._id as Types.ObjectId);
      await user.save();
  
      return this.usersModel.findById(user._id).populate('applyFor').exec();
    }
  
    async scheduledMeeting(
      jobId: string,
      username: string,
      scheduleMeetingDto: ScheduledMeetingDto,
    ): Promise<UsersEntity> {
      const jobEntity = await this.jobModel.findById(jobId);
  
      if (!jobEntity) {
        throw new NotFoundException('Job Application not found!');
      }
  
      jobEntity.scheduledMeeting.push(scheduleMeetingDto);
  
      await jobEntity.save();
  
      const updatedUsers = await this.usersModel.findOne({ username });
  
      if (!updatedUsers) {
        throw new NotFoundException('Users not found!');
      }
  
      return updatedUsers;
    }

    async getAllUsersDetails(): Promise<any[]> {
      const users = await this.usersModel.aggregate([
        {
          $lookup: {
            from: 'jobentities', // Name of the job entities collection (lowercase and plural by default)
            localField: 'applyFor', // Field in the users collection
            foreignField: '_id', // Field in the jobentities collection
            as: 'jobs', // Output array field
          },
        },
        {
          $project: {
            username: 1,
            email: 1,
            'jobs.phoneNumber': 1,
            'jobs.role': 1,
            'jobs.applicationStatus': 1,
          },
        },
      ]).exec();
    
      return users;
    }
    
  



    async updateApplicationStatus(
      username: string,
      role: string,
      applyForDto: ApplyForDto,
    ): Promise<UsersEntity> {
      try {
        // Find the user by username and get the job IDs from the applyFor field
        const userEntity = await this.usersModel.findOne({ username });
    
        // If user not found, throw a NotFoundException
        if (!userEntity) {
          throw new NotFoundException('User not found!');
        }
    
        // Ensure applyFor field is populated with job IDs
        if (!userEntity.applyFor || userEntity.applyFor.length === 0) {
          throw new NotFoundException('No job applications found for this user!');
        }
    
        // Find the job entity by ID and role
        const jobEntity = await this.jobModel.findOne({
          _id: { $in: userEntity.applyFor },
          role,
        });
    
        // If the job with the specified role is not found, throw a NotFoundException
        if (!jobEntity) {
          throw new NotFoundException('Job with the specified role not found!');
        }
    
        // Update the application status of the found job
        jobEntity.applicationStatus = applyForDto.applicationStatus;
    
        // Save the updated job entity
        await jobEntity.save();
    
        // Optionally, if you want to return the updated user with populated job details
        const updatedUser = await this.usersModel
          .findOne({ username })
          .populate('applyFor');
    
        return updatedUser;
      } catch (error) {
        // Log the error for debugging purposes
        console.error('Error updating application status:', error);
    
        // If the error is not a known type, throw a generic InternalServerErrorException
        throw new InternalServerErrorException('An error occurred while updating the application status.');
      }
    }
    
    
  }