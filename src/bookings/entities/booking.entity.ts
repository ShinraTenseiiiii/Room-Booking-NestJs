import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { UsersEntity } from 'src/users/entities/user.entity';
import { Room } from 'src/rooms/entities/room.entity';
export type BookingDocument = HydratedDocument<Booking>;

@Schema()
export class Booking {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: UsersEntity;

  @Prop({ type: String })
  userName: string;

  @Prop({ type: String })
  userEmail: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Room' })
  roomId: Room;

  @Prop({ type: Number })
  roomNumber: number;

  @Prop({ type: Date })
  bookingDate: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);