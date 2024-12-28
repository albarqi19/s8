export interface APIResponse<T> {
  data: T;
  error?: string;
  status: 'success' | 'error';
}

export interface ContentResponse {
  items: Array<{
    id: number;
    name: string;
    content: string;
    type: 'image' | 'url';
  }>;
}

export interface APIError {
  message: string;
  code?: string;
  details?: unknown;
}