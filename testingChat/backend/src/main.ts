import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const whitelist = ['http://localhost:4200', 'api.example.com'];
	app.enableCors({
	origin: function (origin, callback) {
		if (!origin || whitelist.indexOf(origin) !== -1) {
			console.log(1);
		callback(null, true)
		} else {
			console.log(2);
		callback(new Error('Not allowed by CORS'))
		}
	}});
  await app.listen(3000);
}
bootstrap();
