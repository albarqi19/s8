import { Request, Response } from 'express';
import type { ContentItem } from '../../types';

export class SSEManager {
  private clients: Set<Response>;
  private currentContent: ContentItem | null;

  constructor() {
    this.clients = new Set();
    this.currentContent = null;
  }

  addClient(req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    this.clients.add(res);

    if (this.currentContent) {
      res.write(`data: ${JSON.stringify(this.currentContent)}\n\n`);
    }

    req.on('close', () => this.clients.delete(res));
  }

  broadcast(content: ContentItem) {
    this.currentContent = content;
    this.clients.forEach(client => {
      client.write(`data: ${JSON.stringify(content)}\n\n`);
    });
  }
}