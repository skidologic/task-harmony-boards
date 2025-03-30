
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Task, TaskPriority } from '@/types';
import { StatusBadge } from './StatusBadge';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  // Format deadline
  const formatDeadline = () => {
    if (!task.deadline) return 'No deadline';
    
    const isPastDue = isPast(task.deadline) && !isToday(task.deadline);
    
    let deadlineText = '';
    if (isToday(task.deadline)) {
      deadlineText = 'Today';
    } else if (isTomorrow(task.deadline)) {
      deadlineText = 'Tomorrow';
    } else {
      deadlineText = formatDistanceToNow(task.deadline, { addSuffix: true });
    }
    
    return (
      <span className={isPastDue ? 'text-destructive font-medium' : ''}>
        {deadlineText}
      </span>
    );
  };
  
  // Priority indicator
  const getPriorityIndicator = (priority: TaskPriority) => {
    const colors = {
      low: 'bg-green-500',
      medium: 'bg-blue-500',
      high: 'bg-amber-500',
      urgent: 'bg-red-500',
    };
    
    return (
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${colors[priority]}`} />
        <span className="text-xs capitalize">{priority}</span>
      </div>
    );
  };
  
  // Calculate total time spent
  const getTotalTimeSpent = () => {
    const totalMs = task.timeRecords.reduce((total, record) => {
      if (!record.endTime) return total;
      return total + record.duration;
    }, 0);
    
    // Format time nicely
    const minutes = Math.floor(totalMs / 60000);
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  return (
    <Link to={`/tasks/${task.id}`}>
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md group bg-card animate-scale-in glass-card dark:glass-dark">
        <CardHeader className="p-4 border-b">
          <div className="flex justify-between items-start gap-2">
            <StatusBadge status={task.status} />
            {getPriorityIndicator(task.priority)}
          </div>
        </CardHeader>
        
        <CardContent className="p-4 flex-grow">
          <h3 className="font-medium truncate group-hover:text-accent transition-colors mb-2">
            {task.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {task.description}
          </p>
          
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag} 
                  className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
          <div>{formatDeadline()}</div>
          {task.timeRecords.length > 0 && (
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {getTotalTimeSpent()}
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};