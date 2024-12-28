export const SERVER_CONFIG = {
  port: process.env.PORT || 3001,
  cors: {
    origin: ['http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400
  },
  sheets: {
    range: 'Sheet1!A2:D',
    valueRenderOption: 'FORMATTED_VALUE'
  }
};