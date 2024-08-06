import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
 
@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: any): Date {
    const parsedDate = new Date(value);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    return parsedDate;
  }
}