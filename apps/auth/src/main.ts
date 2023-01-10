import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import { APIGatewayProxyEvent, Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app/app.module';
import express from 'express';

let server: Handler;
const expressApp = express();
const adapter = new ExpressAdapter(expressApp);

async function bootstrap(): Promise<Handler> {
	if (!server) {
		const app = await NestFactory.create<NestExpressApplication>(AppModule, adapter);
		app.enableCors();
		app.disable('x-powered-by');
		await app.init();

		server = serverlessExpress({ app: expressApp });
	}

	return server;
}

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
	if (!server) {
		await bootstrap();
	}

	return server(event, context, callback);
};
