
import React from 'react';
import { Button } from '@/components/ui/button';
import { TaskForm } from '@/components/tasks/TaskForm';
import { useNavigate } from 'react-router-dom';

const TaskCreateView: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-3xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
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
        Back
      </Button>
      
      <div className="bg-card rounded-lg border shadow-sm p-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Create New Task</h1>
        <TaskForm />
      </div>
    </div>
  );
};

export default TaskCreateView;
