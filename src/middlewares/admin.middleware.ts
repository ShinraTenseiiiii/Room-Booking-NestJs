import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { UsersEntity } from '../users/entities/user.entity';
import { NextFunction, Response } from 'express';
import { ExpressRequest } from './auth.middleware';

@Injectable()
export class AdminMiddleware implements NestMiddleware {

  async use(req: ExpressRequest, res: Response, next: NextFunction) {
    if (!req.user) { // user check
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    } 
    
    if (req.user.usersType !== 1) { // admin check
      throw new HttpException('user is not an admin', HttpStatus.FORBIDDEN);
    }

    next();
  }
}
