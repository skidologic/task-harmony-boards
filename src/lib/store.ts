import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Comment, TimeRecord, TaskStatus, TaskPriority, Attachment, CommentAttachment } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface TaskState {
  tasks: Task[];
  selectedTaskId: string | null;
  filter: {
    status: TaskStatus | 'all';
    priority: TaskPriority | 'all';
    search: string;
  };
  sort: {
    field: keyof Task | 'timeSpent';
    direction: 'asc' | 'desc';
  };
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'timeRecords' | 'comments'>) => string;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setSelectedTask: (id: string | null) => void;
  
  // Comment Actions
  addComment: (taskId: string, content: string, author: string) => string;
  updateComment: (id: string, content: string) => void;
  deleteComment: (id: string) => void;
  
  // Time Tracking Actions
  startTimeTracking: (taskId: string) => void;
  stopTimeTracking: (taskId: string) => void;
  getTaskTotalTime: (taskId: string) => number;
  
  // Attachment Actions
  addAttachment: (taskId: string, file: Omit<Attachment, 'id' | 'taskId' | 'uploadedAt'>) => void;
  deleteAttachment: (taskId: string, attachmentId: string) => void;
  
  // Comment Attachment Actions
  addCommentAttachment: (commentId: string, file: Omit<CommentAttachment, 'id' | 'commentId' | 'uploadedAt'>) => void;
  deleteCommentAttachment: (commentId: string, attachmentId: string) => void;
  
  // Filter Actions
  setStatusFilter: (status: TaskStatus | 'all') => void;
  setPriorityFilter: (priority: TaskPriority | 'all') => void;
  setSearchFilter: (search: string) => void;
  
  // Sort Actions
  setSortField: (field: keyof Task | 'timeSpent') => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  
  // Filtered and Sorted Tasks
  getFilteredTasks: () => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      selectedTaskId: null,
      filter: {
        status: 'all',
        priority: 'all',
        search: '',
      },
      sort: {
        field: 'deadline',
        direction: 'asc',
      },
      
      // Task Actions
      addTask: (task) => {
        const newTaskId = uuidv4();
        const newTask: Task = {
          id: newTaskId,
          ...task,
          createdAt: new Date(),
          updatedAt: new Date(),
          attachments: [],
          timeRecords: [],
          comments: [],
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
        
        return newTaskId;
      },
      
      updateTask: (id, updatedTask) => {
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === id 
              ? { ...task, ...updatedTask, updatedAt: new Date() } 
              : task
          ),
        }));
      },
      
      deleteTask: (id) => {
        console.log('Deleting task with ID:', id);
        set((state) => {
          // First check if the task exists
          const taskExists = state.tasks.some(task => task.id === id);
          if (!taskExists) {
            console.warn(`Task with ID ${id} not found for deletion`);
            return state; // Return unchanged state
          }
          
          return {
            tasks: state.tasks.filter((task) => task.id !== id),
            selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
          };
        });
      },
      
      setSelectedTask: (id) => {
        set(() => ({ selectedTaskId: id }));
      },
      
      // Comment Actions
      addComment: (taskId, content, author) => {
        const commentId = uuidv4();
        const newComment: Comment = {
          id: commentId,
          taskId,
          author,
          content,
          createdAt: new Date(),
          updatedAt: null,
          attachments: [],
        };
        
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === taskId 
              ? { 
                  ...task, 
                  comments: [...task.comments, newComment],
                  updatedAt: new Date(),
                } 
              : task
          ),
        }));
        
        return commentId;
      },
      
      updateComment: (id, content) => {
        set((state) => ({
          tasks: state.tasks.map((task) => ({
            ...task,
            comments: task.comments.map((comment) => 
              comment.id === id
                ? { ...comment, content, updatedAt: new Date() }
                : comment
            ),
            updatedAt: task.comments.some(comment => comment.id === id) 
              ? new Date() 
              : task.updatedAt,
          })),
        }));
      },
      
      deleteComment: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) => ({
            ...task,
            comments: task.comments.filter((comment) => comment.id !== id),
            updatedAt: task.comments.some(comment => comment.id === id) 
              ? new Date() 
              : task.updatedAt,
          })),
        }));
      },
      
      // Time Tracking Actions
      startTimeTracking: (taskId) => {
        const newRecord: TimeRecord = {
          id: uuidv4(),
          startTime: new Date(),
          endTime: null,
          duration: 0,
        };
        
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === taskId 
              ? { 
                  ...task, 
                  timeRecords: [
                    ...task.timeRecords.map(record => ({ 
                      ...record, 
                      endTime: record.endTime === null ? new Date() : record.endTime,
                      duration: record.endTime === null 
                        ? new Date().getTime() - record.startTime.getTime()
                        : record.duration
                    })),
                    newRecord
                  ],
                  updatedAt: new Date(),
                } 
              : task
          ),
        }));
      },
      
      stopTimeTracking: (taskId) => {
        const endTime = new Date();
        
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === taskId 
              ? { 
                  ...task, 
                  timeRecords: task.timeRecords.map((record, index) => 
                    index === task.timeRecords.length - 1 && record.endTime === null
                      ? { 
                          ...record, 
                          endTime, 
                          duration: endTime.getTime() - record.startTime.getTime(),
                        }
                      : record
                  ),
                  updatedAt: new Date(),
                } 
              : task
          ),
        }));
      },
      
      getTaskTotalTime: (taskId) => {
        const task = get().tasks.find((task) => task.id === taskId);
        if (!task) return 0;
        
        return task.timeRecords.reduce((total, record) => {
          if (record.endTime) {
            return total + record.duration;
          }
          
          // For active sessions, calculate the current duration
          const now = new Date();
          return total + (now.getTime() - record.startTime.getTime());
        }, 0);
      },
      
      // Attachment Actions
      addAttachment: (taskId, file) => {
        const newAttachment: Attachment = {
          id: uuidv4(),
          taskId,
          ...file,
          uploadedAt: new Date(),
        };
        
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === taskId 
              ? { 
                  ...task, 
                  attachments: [...task.attachments, newAttachment],
                  updatedAt: new Date(),
                } 
              : task
          ),
        }));
      },
      
      deleteAttachment: (taskId, attachmentId) => {
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === taskId 
              ? { 
                  ...task, 
                  attachments: task.attachments.filter((a) => a.id !== attachmentId),
                  updatedAt: new Date(),
                } 
              : task
          ),
        }));
      },
      
      // Comment Attachment Actions
      addCommentAttachment: (commentId, file) => {
        const newAttachment: CommentAttachment = {
          id: uuidv4(),
          commentId,
          ...file,
          uploadedAt: new Date(),
        };
        
        set((state) => ({
          tasks: state.tasks.map((task) => ({
            ...task,
            comments: task.comments.map((comment) => 
              comment.id === commentId
                ? { 
                    ...comment, 
                    attachments: [...comment.attachments, newAttachment],
                    updatedAt: new Date(),
                  }
                : comment
            ),
            updatedAt: task.comments.some(comment => comment.id === commentId) 
              ? new Date() 
              : task.updatedAt,
          })),
        }));
      },
      
      deleteCommentAttachment: (commentId, attachmentId) => {
        set((state) => ({
          tasks: state.tasks.map((task) => ({
            ...task,
            comments: task.comments.map((comment) => 
              comment.id === commentId
                ? { 
                    ...comment, 
                    attachments: comment.attachments.filter((a) => a.id !== attachmentId),
                    updatedAt: new Date(),
                  }
                : comment
            ),
            updatedAt: task.comments.some(comment => comment.id === commentId) 
              ? new Date() 
              : task.updatedAt,
          })),
        }));
      },
      
      // Filter Actions
      setStatusFilter: (status) => {
        set((state) => ({
          filter: { ...state.filter, status },
        }));
      },
      
      setPriorityFilter: (priority) => {
        set((state) => ({
          filter: { ...state.filter, priority },
        }));
      },
      
      setSearchFilter: (search) => {
        set((state) => ({
          filter: { ...state.filter, search },
        }));
      },
      
      // Sort Actions
      setSortField: (field) => {
        set((state) => ({
          sort: { ...state.sort, field },
        }));
      },
      
      setSortDirection: (direction) => {
        set((state) => ({
          sort: { ...state.sort, direction },
        }));
      },
      
      // Filtered and Sorted Tasks
      getFilteredTasks: () => {
        const { tasks, filter, sort } = get();
        
        // First, filter the tasks
        const filtered = tasks.filter((task) => {
          // Status filter
          if (filter.status !== 'all' && task.status !== filter.status) {
            return false;
          }
          
          // Priority filter
          if (filter.priority !== 'all' && task.priority !== filter.priority) {
            return false;
          }
          
          // Search filter
          if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            return (
              task.title.toLowerCase().includes(searchLower) ||
              task.description.toLowerCase().includes(searchLower) ||
              task.tags.some((tag) => tag.toLowerCase().includes(searchLower))
            );
          }
          
          return true;
        });
        
        // Then, sort the filtered tasks
        return [...filtered].sort((a, b) => {
          if (sort.field === 'timeSpent') {
            const aTime = get().getTaskTotalTime(a.id);
            const bTime = get().getTaskTotalTime(b.id);
            
            return sort.direction === 'asc' ? aTime - bTime : bTime - aTime;
          }
          
          if (sort.field === 'deadline') {
            // Handle null deadlines
            if (a.deadline === null && b.deadline === null) return 0;
            if (a.deadline === null) return sort.direction === 'asc' ? 1 : -1;
            if (b.deadline === null) return sort.direction === 'asc' ? -1 : 1;
            
            // Make sure we're dealing with Date objects
            const aDate = a.deadline instanceof Date ? a.deadline : new Date(a.deadline);
            const bDate = b.deadline instanceof Date ? b.deadline : new Date(b.deadline);
            
            // Sort by deadline
            return sort.direction === 'asc'
              ? aDate.getTime() - bDate.getTime()
              : bDate.getTime() - aDate.getTime();
          }
          
          // Sort by other fields
          const aValue = a[sort.field];
          const bValue = b[sort.field];
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sort.direction === 'asc'
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }
          
          if (aValue instanceof Date && bValue instanceof Date) {
            return sort.direction === 'asc'
              ? aValue.getTime() - bValue.getTime()
              : bValue.getTime() - aValue.getTime();
          }
          
          return 0;
        });
      },
    }),
    {
      name: 'design-task-store',
    }
  )
);
