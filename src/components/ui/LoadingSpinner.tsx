import React from 'react';
import { RefreshCw } from 'lucide-react';

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-spin text-gray-500 ${className}`}>
    <RefreshCw className="w-8 h-8" />
  </div>
);