import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistance } from 'date-fns';
import { useTaskStore } from '@/lib/store';
import { toast } from 'sonner';
import { Task } from '@/types';
import { TimeTracker } from './TimeTracker';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CommentList } from '../comments/CommentList';
import { CommentForm } from '../comments/CommentForm';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUploader } from '@/components/shared/FileUploader';
import { AttachmentList } from '@/components/shared/AttachmentList';

interface TaskDetailProps {
  task: Task;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ task }) => {
  const navigate = useNavigate();
  const { updateTask, deleteTask, addAttachment, deleteAttachment } = useTaskStore();
  
  // Format dates nicely
  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return format(date, 'PPP');
  };
  
  const formatRelativeTime = (date: Date) => {
    return formatDistance(date, new Date(), { addSuffix: true });
  };
  
  const handleStatusChange = (newStatus: string) => {
    updateTask(task.id, { status: newStatus as Task['status'] });
    toast.success(`Task status updated to ${newStatus}`);
  };
  
  const handleDelete = () => {
    deleteTask(task.id);
    toast.success('Task deleted successfully');
    navigate('/');
  };
  
  const handleFileSelect = (file: File) => {
    // Create a data URL for the file (in a real app, you'd upload to a server)
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        addAttachment(task.id, {
          name: file.name,
          url: e.target.result as string,
          type: file.type,
          size: file.size,
        });
        toast.success(`File "${file.name}" added to task`);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleDeleteAttachment = (attachmentId: string) => {
    deleteAttachment(task.id, attachmentId);
    toast.success('Attachment deleted');
  };
  
  // Determine if the task has time records
  const hasTimeRecords = task.timeRecords.length > 0;
  
  // Check if there's an active time session
  const hasActiveTimeSession = task.timeRecords.some(record => record.endTime === null);
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={task.status} />
            <Select value={task.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40 h-7">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="in-review">In Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <div className="text-muted-foreground text-sm mt-1">
            Created {formatRelativeTime(task.createdAt)}
            {task.updatedAt !== task.createdAt && (
              <> · Updated {formatRelativeTime(task.updatedAt)}</>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={() => navigate(`/tasks/${task.id}/edit`)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this task, all its comments, and time tracking data.
                  {hasActiveTimeSession && (
                    <div className="mt-2 text-destructive font-medium">
                      Warning: This task has an active time tracking session.
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="font-medium">Description</CardHeader>
            <CardContent>
              {task.description ? (
                <div className="prose max-w-none dark:prose-invert">
                  {task.description.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No description provided.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="font-medium flex justify-between items-center">
              <span>Attachments</span>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploader 
                onFileSelect={handleFileSelect} 
                label="Add attachment to task"
              />
              
              {task.attachments.length > 0 ? (
                <AttachmentList 
                  attachments={task.attachments} 
                  onDelete={handleDeleteAttachment}
                  className="mt-4"
                />
              ) : (
                <p className="text-muted-foreground text-sm">No attachments yet.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="font-medium">Comments</CardHeader>
            <CardContent className="space-y-4">
              <CommentForm taskId={task.id} />
              <CommentList taskId={task.id} />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="font-medium">Details</CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Priority</div>
                <div className="capitalize font-medium">{task.priority}</div>
                
                <div className="text-muted-foreground">Deadline</div>
                <div>{task.deadline ? formatDate(task.deadline) : 'Not set'}</div>
                
                <div className="text-muted-foreground">Assignee</div>
                <div>{task.assignee || 'Unassigned'}</div>
              </div>
              
              {task.tags.length > 0 && (
                <div className="pt-2">
                  <div className="text-sm text-muted-foreground mb-2">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="font-medium">Time Tracking</CardHeader>
            <CardContent>
              <TimeTracker taskId={task.id} />
              
              {hasTimeRecords && (
                <div className="mt-4 border-t pt-4">
                  <div className="text-sm font-medium mb-2">Time Log</div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {task.timeRecords
                      .slice()
                      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
                      .map((record) => (
                        <div key={record.id} className="text-xs flex justify-between">
                          <div className="text-muted-foreground">
                            {format(record.startTime, 'MMM d, h:mm a')}
                            {record.endTime && ` - ${format(record.endTime, 'h:mm a')}`}
                          </div>
                          <div>
                            {record.endTime 
                              ? formatDistance(0, record.duration)
                              : 'Active'}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
