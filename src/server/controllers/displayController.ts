import { Request, Response } from 'express';
import { SSEService } from '../services/sseService';
import { SheetsService } from '../services/sheetsService';
import { Logger } from '../services/logger';

class DisplayController {
  private sheetsService = SheetsService.getInstance();
  private sseService = SSEService.getInstance();

  async setupSSE(req: Request, res: Response) {
    try {
      Logger.info('Setting up SSE connection');
      
      // تكوين رؤوس SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5174');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      // إضافة العميل إلى خدمة SSE
      this.sseService.addClient(res);
      
      // إرسال حدث الاتصال
      this.sseService.sendEvent(res, 'connected', { connected: true });
      
      // إرسال المحتوى الحالي إذا كان موجوداً
      const currentContent = this.sheetsService.getCurrentContent();
      if (currentContent) {
        Logger.info('Sending current content:', currentContent);
        this.sseService.sendEvent(res, 'content', currentContent);
      } else {
        // جلب المحتوى الأولي
        try {
          const contents = await this.sheetsService.getContents();
          if (contents.length > 0) {
            const initialContent = contents[0];
            Logger.info('Sending initial content:', initialContent);
            this.sseService.sendEvent(res, 'content', initialContent);
          } else {
            Logger.warn('No content available');
            this.sseService.sendEvent(res, 'warning', 'No content available');
          }
        } catch (error) {
          Logger.error('Error fetching initial content:', error);
          this.sseService.sendEvent(res, 'error', 'Failed to fetch content');
        }
      }

      // إعداد مستمع إغلاق الاتصال
      req.on('close', () => {
        Logger.info('Client disconnected');
        this.sseService.removeClient(res);
      });

      // إرسال نبضة كل 15 ثانية
      const keepAliveInterval = setInterval(() => {
        if (res.writableEnded) {
          clearInterval(keepAliveInterval);
          return;
        }
        this.sseService.sendEvent(res, 'ping', { timestamp: Date.now() });
      }, 15000);

      // تنظيف عند إغلاق الاتصال
      req.on('close', () => {
        clearInterval(keepAliveInterval);
      });

    } catch (error) {
      Logger.error('SSE setup error:', error);
      res.status(500).end();
    }
  }

  async updateDisplay(req: Request, res: Response) {
    try {
      const content = req.body;
      Logger.info('Updating display with content:', content);
      
      await this.sseService.broadcast('content', content);
      res.json({ success: true });
    } catch (error) {
      Logger.error('Error updating display:', error);
      res.status(500).json({ error: 'فشل تحديث العرض' });
    }
  }

  async getCurrentContent(req: Request, res: Response) {
    try {
      const currentContent = this.sheetsService.getCurrentContent();
      res.json(currentContent);
    } catch (error) {
      Logger.error('Error getting current content:', error);
      res.status(500).json({ error: 'فشل جلب المحتوى الحالي' });
    }
  }
}

export const displayController = new DisplayController();