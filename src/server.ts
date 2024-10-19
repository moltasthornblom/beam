import dotenv from 'dotenv';
import connectDB from './db';
import path from 'path';

dotenv.config({ path: '.env' });

connectDB().then(() => {
  seedDatabase(); // Call the seed function after connecting to the database
});;

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes';
import videoRoutes from './routes/videoRoutes';
import streamRoutes from './routes/streamRoutes';
import cors from 'cors';
import seedDatabase from './seed';
import limiter from './middlewares/rateLimiter'; // Implied import for rateLimiter
import checkScope from './middlewares/scopeMiddleware';

const app = express();

const port = 3000;

app.use(cors())
app.use(express.json());
app.use(helmet());
app.use(morgan('combined'));

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Beam API',
      version: '1.0.0',
      description: 'Lightweight API for uploading and streaming videos',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication related endpoints',
      },
      {
        name: 'Videos',
        description: 'Video upload and management endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/hls', express.static(path.join(__dirname, '../uploads/hls'))); // Serve the uploads/hls folder

// Apply rate limiting to specific routes
app.use('/auth', limiter, authRoutes);
app.use('/videos', limiter, videoRoutes);
app.use('/stream', limiter, streamRoutes);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
});
