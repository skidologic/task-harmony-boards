
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useTaskStore } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Task, TaskStatus, TaskPriority, Attachment } from '@/types';
import { FileUploader } from '@/components/shared/FileUploader';
import { AttachmentList } from '@/components/shared/AttachmentList';
import { Loader } from 'lucide-react';

interface TaskFormProps {
  existingTask?: Task;
}

export const TaskForm: React.FC<TaskFormProps> = ({ existingTask }) => {
  const navigate = useNavigate();
  const { addTask, updateTask, deleteAttachment, addAttachment } = useTaskStore();
  
  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [status, setStatus] = useState<TaskStatus>(existingTask?.status || 'todo');
  const [priority, setPriority] = useState<TaskPriority>(existingTask?.priority || 'medium');
  const [deadline, setDeadline] = useState<Date | null>(existingTask?.deadline || null);
  const [assignee, setAssignee] = useState(existingTask?.assignee || '');
  const [tags, setTags] = useState(existingTask?.tags?.join(', ') || '');
  const [attachments, setAttachments] = useState<Attachment[]>(existingTask?.attachments || []);
  const [pendingAttachments, setPendingAttachments] = useState<{
    name: string;
    url: string;
    type: string;
    size: number;
  }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditing = !!existingTask;
  
  const handleFileSelect = useCallback((file: File) => {
    // For large files, let's store just the metadata to avoid exceeding storage quota
    if (file.size > 5 * 1024 * 1024) { // 5MB
      // Only store the file metadata, not the full data URL for large files
      setPendingAttachments(prev => [
        ...prev,
        {
          name: file.name,
          url: URL.createObjectURL(file), // Use object URL instead of data URL
          type: file.type,
          size: file.size,
        }
      ]);
      toast.success(`File "${file.name}" added`);
      return;
    }
    
    // For smaller files, we can still use FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPendingAttachments(prev => [
          ...prev,
          {
            name: file.name,
            url: e.target.result as string,
            type: file.type,
            size: file.size,
          }
        ]);
        toast.success(`File "${file.name}" added`);
      }
    };
    reader.readAsDataURL(file);
  }, []);
  
  const handleRemovePendingAttachment = (index: number) => {
    // Revoke object URL if it's not a data URL
    const attachment = pendingAttachments[index];
    if (attachment.url.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.url);
    }
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleRemoveExistingAttachment = (attachmentId: string) => {
    if (existingTask) {
      deleteAttachment(existingTask.id, attachmentId);
      toast.success('Attachment removed');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const taskData = {
        title,
        description,
        status,
        priority,
        deadline,
        assignee: assignee || null,
        tags: tagsArray,
      };
      
      // Limit the number of attachments to prevent storage quota issues
      const limitedAttachments = pendingAttachments.slice(0, 5);
      
      if (isEditing && existingTask) {
        updateTask(existingTask.id, taskData);
        
        // Add each attachment sequentially to avoid overwhelming localStorage
        for (const attachment of limitedAttachments) {
          try {
            addAttachment(existingTask.id, attachment);
          } catch (error) {
            console.error('Error adding attachment:', error);
            toast.error('Failed to add some attachments due to storage limitations.');
            break;
          }
        }
        
        toast.success('Task updated successfully');
        navigate(`/tasks/${existingTask.id}`);
      } else {
        const newTaskId = addTask(taskData);
        
        // Add each attachment sequentially to avoid overwhelming localStorage
        for (const attachment of limitedAttachments) {
          try {
            addAttachment(newTaskId, attachment);
          } catch (error) {
            console.error('Error adding attachment:', error);
            toast.error('Failed to add some attachments due to storage limitations.');
            break;
          }
        }
        
        toast.success('Task created successfully');
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating/updating task:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Task description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={status} 
              onValueChange={(value) => setStatus(value as TaskStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
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
          
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={priority} 
              onValueChange={(value) => setPriority(value as TaskPriority)}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  id="deadline"
                >
                  {deadline ? (
                    format(deadline, 'PPP')
                  ) : (
                    <span className="text-muted-foreground">Select a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline || undefined}
                  onSelect={setDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {deadline && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeadline(null)}
                className="text-xs text-muted-foreground"
              >
                Clear date
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Input
              id="assignee"
              placeholder="Team member name"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Enter tags separated by commas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas (e.g., design, logo, website)
            </p>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label>Attachments</Label>
            <FileUploader onFileSelect={handleFileSelect} />
            
            {pendingAttachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Pending Attachments</h4>
                <div className="space-y-2">
                  {pendingAttachments.map((attachment, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 border rounded-md bg-secondary/20"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span className="truncate text-sm">{attachment.name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive" 
                        onClick={() => handleRemovePendingAttachment(index)}
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {isEditing && existingTask?.attachments.length > 0 && (
              <AttachmentList 
                attachments={existingTask.attachments} 
                onDelete={handleRemoveExistingAttachment}
                className="mt-4"
              />
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(isEditing ? `/tasks/${existingTask.id}` : '/')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader size={16} className="mr-2 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Update Task' : 'Create Task'
          )}
        </Button>
      </div>
    </form>
  );
};
