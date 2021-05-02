import { Controller, Post, Body, Res } from '@nestjs/common';
import { ForgotPasswordService } from '../services/forgotPassword.service';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ResponseFactory } from '../factories/ResponseFactory';
import { ForgotPasswordDto } from '../dtos/forgotPassword.dto';
import { UserService } from '../services/user.service';
import { EmailQueueProducer } from '../producers/emailQueueProducer';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MailerService } from '@nest-modules/mailer';
import { ReactivatePasswordDto } from '../dtos/reactivatePassword.dto';

@ApiTags('ForgotPassword')
@Controller('forgot-passwords')
export class ForgotPasswordController {

    constructor(
        private forgotPasswordService: ForgotPasswordService,
        private userService: UserService,
        private readonly responseFactory: ResponseFactory,
        private emailQueueProducer: EmailQueueProducer,
        @InjectQueue('email')
        private emailQueue: Queue,
        private readonly mailerService: MailerService,
    ) { }

    @Post('forgot-password')
    async forgotPassword(
        @Body() forgotPasswordDto: ForgotPasswordDto,
        @Res() response: Response,
    ): Promise<any> {
        const { email } = forgotPasswordDto;

        const user = await this.userService.getByEmail(email);

        if(user) {

            //const token = suid(32);
            //const reset_link = 'https://processify.io/#/account/forgot-password/' + token;
            const reset_link = '';
           // await this.userRepository.update(user.id, {token: token, valid_token: new Date()})

            this.emailQueueProducer.add({
                time: new Date(),
                to: email, 
                from: 'webitfactory2020@gmail.com', 
                subject: 'Reset your password', 
                template:  'forgotPassword.html',
                context: {
                    reset_link: reset_link
                }
              });
        } else {
            return this.responseFactory.error('This user doesn`t exist', response);
        }

        return this.responseFactory.ok(user, response);
  }

  @Post('reactivate-password')
  async reactivatePassword(
      @Body() reactivatePasswordDto: ReactivatePasswordDto,
      @Res() response: Response,
  ): Promise<any> {
    
        const { token, new_password, confirm_password } = reactivatePasswordDto;

        //fiecare user o sa aiba un token
        // const user = await this.userRepository.findOne({
        //     where: {
        //         token: token,
        //     },  
        // });

        /*if(user && user.valid_token != null && new Date().getTime() - user.valid_token.getTime() < 86400000) {
            if(new_password === confirm_password) {
                const password_generated = await this.passwordService.generatePassword(
                    reactivatePasswordDto.new_password,
                );
                await this.userRepository.update(user.id, {password: password_generated, token: null})
            } else {
                return this.responseFactory.error("Passwords don`t match", response);
            }

        } else {
            return this.responseFactory.error("Invalid token", response);
        }
        return this.responseFactory.ok(user, response)*/
  }

}