import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoomDocument = Document & Room;

@Schema()
export class Room {
  @Prop({ required: true })
  roomName: string;

  @Prop({ required: true, unique: true })
  roomNumber: string;

  @Prop({ required: true })
  capacity: number;
  
  @Prop({ default: false })
  appliedForSeat: boolean;

  @Prop({ type: [{ type: Date }], default: [] })
  bookedDates: Date[];

  @Prop({ required: true })
  availableSeats: number;
}

export const RoomSchema = SchemaFactory.createForClass(Room);