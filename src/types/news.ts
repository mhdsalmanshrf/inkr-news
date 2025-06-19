
export interface NewsStory {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  source: string;
  publishedAt: string;
  readingTime: number;
  category: string;
}

export interface NewsEdition {
  id: string;
  date: string;
  title: string;
  stories: NewsStory[];
  isToday: boolean;
}

export interface ReadingProgress {
  storyId: string;
  progress: number;
  completed: boolean;
}

export interface UserSettings {
  fontSize: 'small' | 'medium' | 'large';
  sepia: boolean;
}
