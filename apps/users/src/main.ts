import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import { APIGatewayProxyEvent, Callback, Context, Handler } from 'aws-lambda';
import express from 'express';
import { AppModule } from './app/app.module';

let server: Handler;
const expressApp = express();
const adapter = new ExpressAdapter(expressApp);

async function bootstrap(): Promise<Handler> {
	if (!server) {
		const app = await NestFactory.create<NestExpressApplication>(AppModule, adapter);
		app.enableCors();
		app.disable('x-powered-by');
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				enableDebugMessages: true,
			})
		);
		await app.init();

		server = serverlessExpress({ app: expressApp });
	}

	return server;
}

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
	if (!server) {
		await bootstrap();
	}

	console.log('event', event);

	return server(event, context, callback);
};
