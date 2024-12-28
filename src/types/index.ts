export interface ContentItem {
  id: number;
  name: string;
  content: string;
  type: 'image' | 'url';
}

export interface DisplayState {
  currentContent: ContentItem | null;
  isLoading: boolean;
  error: string | null;
}