import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { ContentItem } from '../types';
import { API_CONFIG } from '../services/api/config';

const Display: React.FC = () => {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connectToSSE = useCallback(() => {
    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(`${API_CONFIG.baseURL}/display-updates`, {
        withCredentials: true
      });
      eventSourceRef.current = eventSource;
      
      eventSource.addEventListener('connected', () => {
        console.log('Connected to SSE server');
        setIsConnected(true);
        setError(null);
        setIsReconnecting(false);
      });

      eventSource.addEventListener('content', (event) => {
        try {
          console.log('Received content event:', event.data);
          const data = JSON.parse(event.data);
          console.log('Parsed content:', data);
          setContent(data);
          setError(null);
        } catch (err) {
          console.error('Error parsing content data:', err);
          setError('خطأ في تحليل البيانات');
        }
      });

      eventSource.addEventListener('warning', (event) => {
        console.warn('SSE Warning:', event.data);
        setError(`تحذير: ${event.data}`);
      });

      eventSource.addEventListener('error', (event) => {
        console.error('Server error:', event);
        setIsConnected(false);
        setError('خطأ في الاتصال');
        
        if (!isReconnecting) {
          setIsReconnecting(true);
          console.log('Will attempt to reconnect in 5 seconds...');
          setTimeout(() => {
            console.log('Attempting to reconnect...');
            connectToSSE();
          }, 5000);
        }
      });

      eventSource.addEventListener('ping', () => {
        console.log('Ping received');
      });

      return () => {
        console.log('Closing SSE connection');
        eventSource.close();
      };
    } catch (err) {
      console.error('Error setting up EventSource:', err);
      setError('فشل الاتصال بالخادم');
      
      if (!isReconnecting) {
        setIsReconnecting(true);
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectToSSE();
        }, 5000);
      }
    }
  }, [isReconnecting]);

  useEffect(() => {
    const cleanup = connectToSSE();
    return () => {
      cleanup?.();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connectToSSE]);

  const renderContent = () => {
    if (!content) return null;

    switch (content.type) {
      case 'image':
        return (
          <img
            src={content.content}
            alt={content.name}
            className="w-screen h-screen object-cover"
          />
        );
      case 'url':
        return (
          <iframe
            src={content.content}
            title={content.name}
            className="w-screen h-screen border-0"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      {renderContent()}
    </div>
  );
};
export default Display;