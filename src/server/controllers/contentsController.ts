import { Request, Response } from 'express';
import { Logger } from '../services/logger';
import { SheetsService } from '../services/sheetsService';

export async function getContents(req: Request, res: Response) {
  try {
    Logger.info('getContents called', {
      headers: req.headers,
      query: req.query
    });

    const sheetsService = SheetsService.getInstance();
    Logger.info('SheetsService instance created');

    const contents = await sheetsService.getContents();
    Logger.info('Contents fetched successfully', { count: contents.length });

    return res.status(200).json(contents);
  } catch (error) {
    Logger.error('Error in getContents:', error);
    
    if (error instanceof Error) {
      Logger.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    return res.status(500).json({
      error: true,
      message: 'Failed to fetch contents',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}