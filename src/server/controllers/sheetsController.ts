import { Request, Response } from 'express';
import { SheetsService } from '../../services/sheets';

export const sheetsController = {
  async getContents(req: Request, res: Response) {
    try {
      console.log('Fetching contents...');
      const contents = await SheetsService.getInstance().getContents();
      console.log('Contents fetched:', contents);
      res.json(contents);
    } catch (error) {
      console.error('Error fetching contents:', error);
      res.status(500).json({ 
        error: 'Failed to fetch contents',
        details: error.message 
      });
    }
  }
};