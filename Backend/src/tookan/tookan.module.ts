import { Module } from '@nestjs/common';
import { TookanService } from './tookan.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [TookanService],
  exports: [TookanService],
})
export class TookanModule { }
