export interface Task {
  id: string;
  title: string;
  category: 'Quick' | 'Grind' | 'Cooked';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  isCopied?: boolean;
  isAnalyzing?: boolean; // For AI loading state
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string; // URL
  joinedAt: string;
  isAdmin?: boolean;
  stats: {
    tasksCompleted: number;
    tasksForfeited: number;
    streakDays: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isSOS?: boolean;
}

export interface BellSchedule {
  period: string;
  timeRemaining: string;
  type: 'Class' | 'Break' | 'Lunch';
}

export enum TrailState {
  BLAZING = 'Blazing', // < 15m
  WARM = 'Warm',       // < 2h
  FADING = 'Fading'    // < 12h
}

export interface IntelSource {
  title: string;
  url: string;
  snippet: string;
}

export interface IntelDrop {
  id: string;
  author_id: string;
  author_username?: string;
  author_avatar?: string;
  query: string;
  summary_bullets: string[];
  sources: IntelSource[];
  related_concepts: string[];
  is_private: boolean;
  created_at: string;
}