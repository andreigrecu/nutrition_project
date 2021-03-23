import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
const { router } = require('bull-board');

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    cors: {
      "origin": "*",
      "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "preflightContinue": false,
      "optionsSuccessStatus": 204
    }
  });

  const options = new DocumentBuilder()
  .setTitle('My API')
  .addBearerAuth()
  .setDescription('API description')
  .setVersion('1.0')
  .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.use('/admin/queues', router)
  await app.listen(4400);
}
bootstrap();
