export interface User {
  id: string;
  email: string;
  password_hash: string;
  api_key?: string;
  fcmToken?: string;
  is_active: boolean;
  is_admin: boolean;
  notifyOnCompletion?: boolean;
  notifyOnFailure?: boolean;
  notifyOnStart?: boolean;
  notifyOnNewResults?: boolean;
  notifyDailySummary?: boolean;
  lastNotificationTime?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Operation {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target: string;
  type: 'dictionary' | 'brute_force' | 'rainbow_table' | 'hybrid' | 'mask' | 'rules';
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  total_attempts: number;
  successful_attempts: number;
  failed_attempts: number;
  started_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Result {
  id: string;
  operation_id: string;
  result_type: 'success' | 'attempt' | 'error';
  username?: string;
  password?: string;
  data?: Record<string, any>;
  timestamp: Date;
}

export interface Log {
  id: string;
  operation_id?: string;
  user_id?: string;
  level: 'error' | 'warn' | 'info' | 'debug' | 'success';
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface Target {
  id: string;
  user_id: string;
  name: string;
  protocol: 'ssh' | 'http' | 'ftp' | 'database' | 'custom';
  host: string;
  port?: number;
  username?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Wordlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  file_path: string;
  line_count?: number;
  file_size?: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'auto';
  font_size: number;
  primary_color: string;
  notifications_enabled: boolean;
  max_attempts: number;
  connection_delay: number;
  max_threads: number;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
