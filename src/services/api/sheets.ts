import { apiClient } from './client';
import type { ContentItem } from '../../types';

export async function fetchContents(): Promise<ContentItem[]> {
  return apiClient<ContentItem[]>('/contents');
}