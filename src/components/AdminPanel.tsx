import React, { useCallback, useEffect, useState } from 'react';
import { Settings, RefreshCw } from 'lucide-react';
import { useContents } from '../hooks/useContents';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import type { ContentItem } from '../types';
import { API_CONFIG } from '../services/api/config';

export const AdminPanel: React.FC = () => {
  const { contents, loading, error, refresh } = useContents();
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null);
  const [fetchingCurrent, setFetchingCurrent] = useState(false);

  // جلب المحتوى الحالي
  const fetchCurrentContent = async () => {
    try {
      setFetchingCurrent(true);
      const response = await fetch(`${API_CONFIG.baseURL}/current-content`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setCurrentContent(data);
        }
      }
    } catch (err) {
      console.error('Error fetching current content:', err);
    } finally {
      setFetchingCurrent(false);
    }
  };

  // تحديث المحتوى الحالي كل 5 ثوانٍ
  useEffect(() => {
    fetchCurrentContent();
    const interval = setInterval(fetchCurrentContent, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleContentSelect = useCallback(async (content: ContentItem) => {
    try {
      console.log('Sending content to display:', content);
      const response = await fetch(`${API_CONFIG.baseURL}/display`, {
        method: 'POST',
        headers: {
          ...API_CONFIG.headers,
          'Accept': 'application/json'
        },
        credentials: API_CONFIG.withCredentials ? 'include' : 'omit',
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        console.error('Error response:', response);
        const errorData = await response.json();
        console.error('Error data:', errorData);
        throw new Error(errorData.error || 'فشل تحديث العرض');
      }

      setCurrentContent(content);
      console.log('Content update successful');
    } catch (err) {
      console.error('Error updating display:', err);
    }
  }, []);

  if (error) {
    console.error('Content loading error:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b pb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
                <Settings className="w-8 h-8 text-indigo-600" />
                لوحة التحكم بالعرض
              </h1>
              <p className="text-gray-600">اختر المحتوى الذي تريد عرضه على الشاشة</p>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-200"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              تحديث المحتوى
            </button>
          </div>

          {/* Current Content Display */}
          <div className="mb-8 p-4 bg-indigo-50 rounded-xl border-2 border-indigo-100">
            <h2 className="text-lg font-semibold text-indigo-800 mb-2">المحتوى المعروض حالياً:</h2>
            {fetchingCurrent ? (
              <div className="flex items-center justify-center h-16">
                <LoadingSpinner />
              </div>
            ) : currentContent ? (
              <div className="flex items-center gap-4">
                {currentContent.type === 'image' && (
                  <img
                    src={currentContent.content}
                    alt={currentContent.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                {currentContent.type === 'url' && (
                  <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🌐</span>
                  </div>
                )}
                <div>
                  <div className="font-medium text-indigo-900">{currentContent.name}</div>
                  <div className="text-sm text-indigo-600">
                    النوع: {currentContent.type === 'image' ? 'صورة' : 'رابط'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                لا يوجد محتوى معروض حالياً
              </div>
            )}
          </div>

          {error && <ErrorMessage message={error} className="mb-6" />}

          <div className="relative min-h-[400px]">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 backdrop-blur-sm rounded-xl">
                <LoadingSpinner />
              </div>
            )}

            {contents.length === 0 && !loading && !error ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                <p className="text-xl">لا يوجد محتوى متاح</p>
                <p className="mt-2">قم بإضافة محتوى في Google Sheets</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contents.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleContentSelect(item)}
                    className={`group relative bg-gray-50 rounded-xl p-4 transition-colors duration-200 border-2 
                      ${currentContent?.id === item.id 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-transparent hover:border-indigo-200 hover:bg-indigo-50'} 
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                  >
                    {currentContent?.id === item.id && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-sm">
                        قيد العرض
                      </div>
                    )}
                    {item.type === 'image' && (
                      <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-200">
                        <img
                          src={item.content}
                          alt={item.name}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}
                    {item.type === 'url' && (
                      <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                        <div className="text-4xl text-gray-400 group-hover:text-indigo-500 transition-colors duration-200">
                          🌐
                        </div>
                      </div>
                    )}
                    <div className="text-lg font-semibold text-gray-800 mb-2">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      النوع: {item.type === 'image' ? 'صورة' : 'رابط'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-gray-600">
            <p>تطوير أحمد البارقي لجامع سعيد رداد</p>
          </div>
        </div>
      </div>
    </div>
  );
};