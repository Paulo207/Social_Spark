export type Platform = 'instagram' | 'facebook' | 'both';

export type PostStatus = 'scheduled' | 'published' | 'failed' | 'draft';

export interface SocialAccount {
  id: string;
  platform: 'instagram' | 'facebook';
  username: string;
  profileImage: string;
  isConnected: boolean;
  followers?: number;
  accessToken?: string;
  originalResponse?: any;
  lastSync?: Date;
  pageId?: string;
  igUserId?: string;
  tokenExpiresAt?: Date;
}

export interface Post {
  id: string;
  caption: string;
  images: string[];
  platform: Platform;
  accountId: string;
  scheduledDate: Date;
  status: PostStatus;
  createdAt: Date;
  publishedAt?: Date;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface DashboardStats {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  totalEngagement: number;
  engagementRate: number;
  topPerformingPost?: Post;
}

export interface CalendarDay {
  date: Date;
  posts: Post[];
  isCurrentMonth: boolean;
  isToday: boolean;
}
