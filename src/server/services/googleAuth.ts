import { google } from 'googleapis';
import { GOOGLE_SHEETS_CONFIG } from '../../config/google-sheets';
import { Logger } from './logger';

export function createGoogleAuth() {
  try {
    Logger.info('Creating Google Auth client');
    const auth = new google.auth.GoogleAuth({
      credentials: GOOGLE_SHEETS_CONFIG.credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    Logger.info('Google Auth client created successfully');
    return auth;
  } catch (error) {
    Logger.error('Error creating Google Auth client:', error);
    throw error;
  }
}