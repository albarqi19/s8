import { Response } from 'express';
import type { ContentItem } from '../../types';
import { Logger } from './logger';

export class SSEService {
  private static instance: SSEService;
  private clients: Set<Response>;
  private currentContent: ContentItem | null;

  private constructor() {
    this.clients = new Set();
    this.currentContent = null;
  }

  static getInstance(): SSEService {
    if (!this.instance) {
      this.instance = new SSEService();
    }
    return this.instance;
  }

  addClient(res: Response): void {
    try {
      this.clients.add(res);
      Logger.info('Client added to SSE service', {
        totalClients: this.clients.size
      });

      // إرسال المحتوى الحالي إذا كان متوفراً
      if (this.currentContent) {
        this.sendEvent(res, 'content', this.currentContent);
      }
    } catch (error) {
      Logger.error('Error adding SSE client:', error);
    }
  }

  removeClient(res: Response): void {
    try {
      this.clients.delete(res);
      Logger.info('Client removed from SSE service', {
        totalClients: this.clients.size
      });
    } catch (error) {
      Logger.error('Error removing SSE client:', error);
    }
  }

  async broadcast(eventName: string, data: any): Promise<void> {
    try {
      if (eventName === 'content') {
        this.currentContent = data;
      }

      Logger.info(`Broadcasting ${eventName} event to ${this.clients.size} clients`);
      
      const deadClients = new Set<Response>();
      
      for (const client of this.clients) {
        try {
          if (!client.writableEnded) {
            this.sendEvent(client, eventName, data);
          } else {
            deadClients.add(client);
          }
        } catch (error) {
          Logger.error('Error sending to client:', error);
          deadClients.add(client);
        }
      }

      // إزالة العملاء غير النشطين
      deadClients.forEach(client => {
        this.removeClient(client);
      });

    } catch (error) {
      Logger.error('Broadcast error:', error);
      throw error;
    }
  }

  sendEvent(res: Response, eventName: string, data: any): void {
    try {
      if (!res.writableEnded) {
        res.write(`event: ${eventName}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        Logger.debug(`Sent ${eventName} event to client`);
      }
    } catch (error) {
      Logger.error('Error sending event:', error);
      throw error;
    }
  }
}