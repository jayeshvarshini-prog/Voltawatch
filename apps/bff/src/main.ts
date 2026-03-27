import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { WsAdapter } from '@nestjs/platform-ws';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.useWebSocketAdapter(new WsAdapter(app));

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:8080', 'http://localhost:8081'],
    credentials: true,
  });

  const port = process.env.BFF_PORT || 3000;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`BFF server running on http://localhost:${port}`);
}

bootstrap();
