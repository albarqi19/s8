import express from 'express';
import { SheetsService } from '../services/sheets';

const app = express();
app.use(express.json());

let currentContent: any = null;
const clients = new Set<any>();

app.get('/api/contents', async (req, res) => {
  try {
    const sheetsService = SheetsService.getInstance();
    const contents = await sheetsService.getContents();
    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contents' });
  }
});

app.get('/api/display-updates', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  clients.add(res);

  if (currentContent) {
    res.write(`data: ${JSON.stringify(currentContent)}\n\n`);
  }

  req.on('close', () => clients.delete(res));
});

app.post('/api/display', (req, res) => {
  const { id } = req.body;
  
  SheetsService.getInstance()
    .getContents()
    .then(contents => {
      currentContent = contents.find(item => item.id === id);
      
      clients.forEach(client => {
        client.write(`data: ${JSON.stringify(currentContent)}\n\n`);
      });
      
      res.json({ success: true });
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to update display' });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});