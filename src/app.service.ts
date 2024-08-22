import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): boolean {
    console.log('server running on port 3000');
    return true; // boolean responce for flutter
  }
}
