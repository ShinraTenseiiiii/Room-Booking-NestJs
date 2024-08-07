import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Room } from 'src/rooms/entities/room.entity';
import { UsersEntity } from 'src/users/entities/user.entity';

@Schema()
export class Booking extends Document {
  @Prop({ type: Types.ObjectId, ref: 'UsersEntity', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  roomId: Types.ObjectId;

  @Prop({ required: true })
  bookingDate: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
