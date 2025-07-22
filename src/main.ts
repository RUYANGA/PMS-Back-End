import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { LoggerService } from "./logger/logger.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
        : true, // Allow all origins if not set
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      credentials: true,
    },
  });

  // Use custom logger
  const customLogger = app.get(LoggerService);
  app.useLogger(customLogger);

  const port = process.env.PORT ?? 3210;
  const appName = process.env.APP_NAME ?? "Kangalos";
  const apiPrefix = "api";

  const localServer = process.env.LOCAL_SERVER;
  const productionServer = process.env.PRODUCTION_SERVER;

  const configBuilder = new DocumentBuilder()
    .setTitle("Kangalos: Project Management Platform API")
    .setDescription(
      `An all-in-one web application built for the University of Rwanda and its partner institutions. The platform acts as the definitive, long-term hub where every research project, student thesis, community innovation, and externally funded initiative can be discovered, tracked, and celebrated.`
    )
    .setVersion("1.0");

  if (localServer) {
    configBuilder.addServer(localServer, "Local Development Server");
  }

  if (productionServer) {
    configBuilder.addServer(productionServer, "Production Server");
  }

  const config = configBuilder
    .addTag("App")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT Token",
        in: "header",
      },
      "JWT-auth"
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, documentFactory, {
    jsonDocumentUrl: "api-docs-json",
    swaggerOptions: {
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  app.setGlobalPrefix(apiPrefix, {
    exclude: ["/", "api/v1"],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  await app.listen(port);

  customLogger.log(
    `${appName} has started successfully and is running on port ${port} and you can run it on http://localhost:${port}`,
    "Bootstrap"
  );
}
bootstrap().catch((err) => {
  Logger.error(`Failed to start application: ${err}`, "Bootstrap");
  process.exit(1);
});
