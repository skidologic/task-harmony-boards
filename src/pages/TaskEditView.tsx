
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskStore } from '@/lib/store';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/button';

const TaskEditView: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { tasks } = useTaskStore();
  
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Task Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The task you're trying to edit doesn't exist or has been deleted.
        </p>
        <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/tasks/${taskId}`)}
        className="mb-4"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="mr-2"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        Back to Task
      </Button>
      
      <div className="bg-card rounded-lg border shadow-sm p-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Edit Task</h1>
        <TaskForm existingTask={task} />
      </div>
    </div>
  );
};

export default TaskEditView;
