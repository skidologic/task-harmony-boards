
import React, { useState } from 'react';
import { formatDistance } from 'date-fns';
import { useTaskStore } from '@/lib/store';
import { toast } from 'sonner';
import { Comment } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AttachmentList } from '@/components/shared/AttachmentList';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CommentListProps {
  taskId: string;
}

export const CommentList: React.FC<CommentListProps> = ({ taskId }) => {
  const { tasks, updateComment, deleteComment, deleteCommentAttachment } = useTaskStore();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return <div>Task not found</div>;
  }
  
  const comments = task.comments;
  
  if (comments.length === 0) {
    return <div className="text-muted-foreground text-sm">No comments yet.</div>;
  }
  
  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };
  
  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent('');
  };
  
  const saveEdit = (commentId: string) => {
    if (editContent.trim()) {
      updateComment(commentId, editContent);
      setEditingCommentId(null);
      setEditContent('');
      toast.success('Comment updated');
    } else {
      toast.error('Comment cannot be empty');
    }
  };
  
  const handleDeleteAttachment = (commentId: string, attachmentId: string) => {
    deleteCommentAttachment(commentId, attachmentId);
    toast.success('Attachment deleted');
  };
  
  return (
    <div className="space-y-6">
      {comments
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((comment) => (
          <div key={comment.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{comment.author}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistance(comment.createdAt, new Date(), { addSuffix: true })}
                  {comment.updatedAt && (
                    <span> (edited {formatDistance(comment.updatedAt, new Date(), { addSuffix: true })})</span>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => startEditing(comment)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this comment? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          deleteComment(comment.id);
                          toast.success('Comment deleted');
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            
            {editingCommentId === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={cancelEditing}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveEdit(comment.id)}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-sm">
                {comment.content}
              </div>
            )}
            
            {/* Display comment attachments */}
            {comment.attachments && comment.attachments.length > 0 && (
              <AttachmentList 
                attachments={comment.attachments} 
                onDelete={(attachmentId) => handleDeleteAttachment(comment.id, attachmentId)}
                className="mt-2"
              />
            )}
          </div>
        ))}
    </div>
  );
};
