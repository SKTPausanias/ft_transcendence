import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT, process.env.ADDRESS);
  console.log("\x1b[36m%s", "Server ready:", "\x1b[35m", await app.getUrl(), "\x1b[0m");
  var obj = process.env.CONTRIBUTORS.split(' ');
  console.log(obj);
  console.log(process.env.TEST)
}
bootstrap();
