export interface ContentItem {
  id: number;
  name: string;
  content: string;
  type: 'image' | 'url';
}

export interface ApiResponse {
  success: boolean;
  error?: string;
}
