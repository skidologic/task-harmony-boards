
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TaskStatus } from '@/types';

interface StatusConfig {
  label: string;
  color: string;
}

const STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  backlog: {
    label: 'Backlog',
    color: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
  },
  todo: {
    label: 'To Do',
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  },
  'in-progress': {
    label: 'In Progress',
    color: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  },
  'in-review': {
    label: 'In Review',
    color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700 hover:bg-green-200',
  },
};

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status];
  
  return (
    <Badge 
      className={`${config.color} ${className} transition-all duration-300`}
      variant="outline"
    >
      {config.label}
    </Badge>
  );
};
