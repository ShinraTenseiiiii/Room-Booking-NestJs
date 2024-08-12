import { MiddlewareConsumer, Module, RequestMethod, Post, Get } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { AdminMiddleware } from './middlewares/admin.middleware';
import { envOptions } from './config/envConfig';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    ConfigModule.forRoot(envOptions),
    UsersModule,
    MongooseModule.forRoot(process.env.MONGO_URI),
    RoomsModule,
    BookingsModule
  ],
  controllers: [AppController, ],
  providers: [AppService, ],
})
export class AppModule {

  // auth middleware 

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
       {   path: '*',  method: RequestMethod.ALL,},
     {  path: 'bookings/booking-details/:userId',  method: RequestMethod.GET},
     
    );


// TODO ADMIN MIDDLEWARE

    consumer.apply(AdminMiddleware).forRoutes(
      { path: 'users/update-application-status/:username/:role', method: RequestMethod.ALL },
      { path: 'users/all-users', method: RequestMethod.ALL },
      { path: 'users/schedule-meeting/:username/:jobId', method: RequestMethod.ALL },
      //room controller routes
      { path: 'rooms/create', method: RequestMethod.POST },
      //booking details 
     // {  path: 'bookings/booking-details',  method: RequestMethod.GET},
      // room
      { path: 'bookings/room-details', method: RequestMethod.GET},
     { path: 'bookings/room-details/:roomId/:date', method: RequestMethod.GET },   // TODO
     { path : 'bookings/room-details/:roomId', method: RequestMethod.GET},
    );
  }


}
