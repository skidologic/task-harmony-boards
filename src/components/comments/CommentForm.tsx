
import React, { useState } from 'react';
import { useTaskStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FileUploader } from '@/components/shared/FileUploader';
import { CommentAttachment } from '@/types';

interface CommentFormProps {
  taskId: string;
  onSuccess?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({ 
  taskId,
  onSuccess 
}) => {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState(localStorage.getItem('commentAuthor') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<{
    name: string;
    url: string;
    type: string;
    size: number;
  }[]>([]);
  
  const { addComment, addCommentAttachment } = useTaskStore();
  
  const handleFileSelect = (file: File) => {
    // Create a data URL for the file (in a real app, you'd upload to a server)
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
        toast.success(`File "${file.name}" attached to comment`);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemovePendingAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    
    if (!author.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save the author name for future comments
      localStorage.setItem('commentAuthor', author);
      
      // Add the comment
      const commentId = addComment(taskId, content, author);
      
      // Add any attachments
      pendingAttachments.forEach(attachment => {
        addCommentAttachment(commentId, attachment);
      });
      
      // Reset form
      setContent('');
      setPendingAttachments([]);
      
      // Notify success
      toast.success('Comment added');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <Textarea
          placeholder="Add your comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <input
            type="text"
            placeholder="Your name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Add Comment'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* File attachment */}
      <div className="pt-2">
        <FileUploader onFileSelect={handleFileSelect} label="Add attachment to comment" />
        
        {/* Display pending attachments */}
        {pendingAttachments.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Comment Attachments</h4>
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
      </div>
    </form>
  );
};
