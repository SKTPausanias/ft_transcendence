import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT, process.env.ADDRESS);
  console.log("\x1b[36m%s", "Server ready:", "\x1b[35m", await app.getUrl(), "\x1b[0m");
  var obj = process.env.CONTRIBUTORS.split(' ');
  console.log(obj);
}
bootstrap();
