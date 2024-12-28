import express from 'express';
import cors from 'cors';
import { SERVER_CONFIG } from './config/server.config';
import { errorHandler } from './middleware/errorMiddleware';
import contentsRoutes from './routes/contents.routes';
import displayRoutes from './routes/display.routes';
import { Logger } from './services/logger';

async function startServer() {
  try {
    const app = express();

    // Middleware
    app.use(cors(SERVER_CONFIG.cors));
    app.use(express.json());

    // Request logging
    app.use((req, res, next) => {
      Logger.info(`${req.method} ${req.url}`, {
        headers: req.headers,
        query: req.query,
        body: req.body
      });
      next();
    });

    // Health check
    app.get('/api/health', (_, res) => {
      Logger.info('Health check endpoint called');
      res.json({ status: 'ok' });
    });

    // Routes
    app.use('/api', contentsRoutes);
    app.use('/api', displayRoutes);

    // Error handling
    app.use(errorHandler);

    // Start server
    app.listen(SERVER_CONFIG.port, () => {
      Logger.info(`Server running on port ${SERVER_CONFIG.port}`);
      Logger.info('CORS configuration:', SERVER_CONFIG.cors);
    });
  } catch (error) {
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();