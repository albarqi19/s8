import { Request, Response, NextFunction } from 'express';
import { Logger } from '../services/logger';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  Logger.error('Server error:', err);
  
  // Don't expose internal errors to clients in production
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Internal server error';

  res.status(500).json({
    error: true,
    message,
    path: req.path,
    timestamp: new Date().toISOString()
  });
}