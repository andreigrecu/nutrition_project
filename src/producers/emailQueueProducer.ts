import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailQueueProducer {

  constructor(
        @InjectQueue('email')
        private readonly emailQueue: Queue
    ) {}

  async add(data: any) {
    await this.emailQueue.add(data, { 
        attempts: 2,
        backoff: 5000,
        delay: 1000
    });
  }
}