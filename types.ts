
export type Tab = 'chat' | 'library' | 'settings';
export type UserRole = 'student' | 'lecturer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastActive: string;
  recentActivity?: string;
}

export interface Course {
  id: string;
  name: string;
  department: string;
  iconName: string;
  description: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image';
  source: 'institutional' | 'personal';
  tags: string[];
  content?: string;
  url?: string;
  locked?: boolean;
  uploadedBy?: string;
  uploadDate?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  isThinking?: boolean;
  deepStudy?: boolean;
}

export interface UsageStats {
  used: number;
  total: number;
}
