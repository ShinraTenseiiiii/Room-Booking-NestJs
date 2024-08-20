import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): boolean {
    console.log('hello');
    return true; // boolean responce for flutter
  }
}