import { google } from 'googleapis';
import { GOOGLE_SHEETS_CONFIG } from '../../config/google-sheets';

export function createGoogleAuth() {
  try {
    console.log('إنشاء مصادقة Google...');
    
    const auth = new google.auth.GoogleAuth({
      credentials: GOOGLE_SHEETS_CONFIG.credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    console.log('تم إنشاء مصادقة Google بنجاح');
    return auth;
  } catch (error) {
    console.error('فشل في إنشاء مصادقة Google:', error);
    throw new Error('فشل في إنشاء مصادقة Google');
  }
}