import { google } from 'googleapis';
import { GOOGLE_SHEETS_CONFIG } from '../config/google-sheets';
import type { ContentItem } from '../types';

export class SheetsService {
  private static instance: SheetsService;
  private sheets;

  private constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: GOOGLE_SHEETS_CONFIG.credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  public static getInstance(): SheetsService {
    if (!SheetsService.instance) {
      SheetsService.instance = new SheetsService();
    }
    return SheetsService.instance;
  }

  public async getContents(): Promise<ContentItem[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: 'Sheet1!A2:D', // تحديث اسم الورقة إلى Sheet1
        valueRenderOption: 'UNFORMATTED_VALUE',
      });

      if (!response.data.values) {
        return [];
      }

      return response.data.values.map((row, index) => ({
        id: index + 1,
        name: row[0]?.toString() || `محتوى ${index + 1}`,
        content: row[1]?.toString() || '',
        type: this.determineContentType(row[1]?.toString() || ''),
      }));
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      throw new Error('فشل في جلب البيانات من Google Sheets');
    }
  }

  private determineContentType(content: string): 'image' | 'url' {
    if (!content) return 'url';
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => content.toLowerCase().includes(ext)) ? 'image' : 'url';
  }
}