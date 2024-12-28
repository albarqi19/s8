import { google } from 'googleapis';
import { createGoogleAuth } from './googleAuth';
import { GOOGLE_SHEETS_CONFIG } from '../../config/google-sheets';
import type { ContentItem } from '../../types';
import { Logger } from './logger';

export class SheetsService {
  private static instance: SheetsService;
  private sheets;
  private currentContent: ContentItem | null = null;

  private constructor() {
    try {
      const auth = createGoogleAuth();
      this.sheets = google.sheets({ version: 'v4', auth });
      Logger.info('Google Sheets service initialized');
    } catch (error) {
      Logger.error('Failed to initialize Google Sheets service', error);
      throw error;
    }
  }

  public static getInstance(): SheetsService {
    if (!SheetsService.instance) {
      SheetsService.instance = new SheetsService();
    }
    return SheetsService.instance;
  }

  async getContents(): Promise<ContentItem[]> {
    try {
      Logger.info('Fetching sheet data...');
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: `${GOOGLE_SHEETS_CONFIG.sheetName}!A2:D`,
        valueRenderOption: 'FORMATTED_VALUE',
      });

      Logger.debug('Sheet response received', response.data);

      if (!response.data.values) {
        Logger.warn('No data found in sheet, using mock data');
        return [];
      }

      const contents = this.transformSheetData(response.data.values);
      Logger.info('Transformed contents:', contents);
      return contents;
    } catch (error) {
      Logger.error('Failed to fetch sheet data', error);
      if (error instanceof Error) {
        Logger.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    }
  }

  async getContent(id: number): Promise<ContentItem | null> {
    try {
      const contents = await this.getContents();
      const content = contents.find(item => item.id === id);
      if (content) {
        this.currentContent = content;
      }
      return content;
    } catch (error) {
      Logger.error('Error fetching content:', error);
      throw error;
    }
  }

  getCurrentContent(): ContentItem | null {
    return this.currentContent;
  }

  private transformSheetData(rows: any[]): ContentItem[] {
    return rows.map((row, index) => ({
      id: index + 1,
      name: row[0] || `المحتوى ${index + 1}`,
      content: row[1] || '',
      type: this.determineContentType(row[1]),
    }));
  }

  private determineContentType(content?: string): 'image' | 'url' {
    if (!content) return 'url';
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
    const urlPattern = /^(https?:\/\/)/i;

    if (imageExtensions.test(content)) {
      return 'image';
    } else if (urlPattern.test(content)) {
      return 'url';
    }
    return 'url';
  }
}