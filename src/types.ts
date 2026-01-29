export type Platform = 'instagram' | 'facebook' | 'both';

export type PostStatus = 'idea' | 'draft' | 'approval' | 'scheduled' | 'published' | 'failed';

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

export interface MediaAsset {
  id: string;
  userId: string;
  url: string;
  publicId: string;
  resourceType: 'image' | 'video';
  fileType: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;

  aiCaption?: string;
  aiHashtags?: string[];
  aiAnalysis?: any;

  userCaption?: string;
  userTags?: string[];
  description?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface MediaUploadResponse {
  asset: MediaAsset;
  message: string;
}

export interface MediaListResponse {
  assets: MediaAsset[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

