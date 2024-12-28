import { Express } from 'express';
import { sheetsController } from '../controllers/sheetsController';
import { displayController } from '../controllers/displayController';

export function setupRoutes(app: Express) {
  // Google Sheets routes
  app.get('/api/contents', sheetsController.getContents);
  
  // Display routes
  app.get('/api/display-updates', displayController.setupSSE);
  app.post('/api/display', displayController.updateDisplay);
}