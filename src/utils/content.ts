// وظائف مساعدة للمحتوى
export function determineContentType(url: string): 'image' | 'url' {
  if (!url) return 'url';
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return imageExtensions.some(ext => url.toLowerCase().includes(ext)) 
    ? 'image' 
    : 'url';
}