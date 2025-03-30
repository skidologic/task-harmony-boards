
export type TaskStatus = 
  | 'backlog'
  | 'todo'
  | 'in-progress'
  | 'in-review'
  | 'completed';

export type TaskPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export interface TimeRecord {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in milliseconds
}

export interface Attachment {
  id: string;
  taskId: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface CommentAttachment {
  id: string;
  commentId: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  author: string;
  content: string;
  createdAt: Date;
  updatedAt: Date | null;
  attachments: CommentAttachment[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignee: string | null;
  attachments: Attachment[];
  timeRecords: TimeRecord[];
  comments: Comment[];
  tags: string[];
}

export interface SortOption {
  label: string;
  value: keyof Task | 'timeSpent';
  direction: 'asc' | 'desc';
}
