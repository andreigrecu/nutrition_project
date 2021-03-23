import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';
import { setQueues, BullAdapter } from 'bull-board';

@Processor('email')
export class EmailQueueConsumer {
  constructor(
    @InjectQueue('email')
    private emailQueue: Queue,
    private mailerService: MailerService
  ) {

    setQueues([
      new BullAdapter(this.emailQueue)
    ]);

    this.emailQueue.process((job, done) => {
      this.mailerService.sendMail(job.data)
        .then(() => {
          done(null);
        })
        .catch((error) => {
          done(error);
        })
    })
  }
}