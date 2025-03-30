
import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/lib/store';
import { TaskCard } from './TaskCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TaskPriority, TaskStatus, SortOption } from '@/types';

const sortOptions: SortOption[] = [
  { label: 'Deadline (earliest)', value: 'deadline', direction: 'asc' },
  { label: 'Deadline (latest)', value: 'deadline', direction: 'desc' },
  { label: 'Priority (highest)', value: 'priority', direction: 'desc' },
  { label: 'Priority (lowest)', value: 'priority', direction: 'asc' },
  { label: 'Recently Updated', value: 'updatedAt', direction: 'desc' },
  { label: 'Time Spent (most)', value: 'timeSpent', direction: 'desc' },
  { label: 'Time Spent (least)', value: 'timeSpent', direction: 'asc' },
];

export const TaskList: React.FC = () => {
  const { 
    getFilteredTasks,
    filter,
    setStatusFilter,
    setPriorityFilter,
    setSortField,
    setSortDirection,
    sort,
  } = useTaskStore();
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    try {
      const filteredTasks = getFilteredTasks();
      setTasks(filteredTasks);
      setError(null);
    } catch (err) {
      console.error('Error filtering tasks:', err);
      setTasks([]);
      setError('Error loading tasks. Please try again later.');
    }
  }, [getFilteredTasks, filter, sort]);
  
  const handleStatusChange = (status: string) => {
    setStatusFilter(status as TaskStatus | 'all');
  };
  
  const handlePriorityChange = (priority: string) => {
    setPriorityFilter(priority as TaskPriority | 'all');
  };
  
  const handleSortChange = (sortOptionIndex: string) => {
    const option = sortOptions[parseInt(sortOptionIndex)];
    setSortField(option.value);
    setSortDirection(option.direction);
  };
  
  const getCurrentSortIndex = () => {
    return sortOptions.findIndex(
      (option) => option.value === sort.field && option.direction === sort.direction
    ).toString();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">Manage your design tasks efficiently.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="sm:order-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
          </Button>
          
          <Select defaultValue={getCurrentSortIndex()} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button asChild variant="default" size="sm" className="sm:order-first">
            <Link to="/tasks/new">
              <Plus size={16} className="mr-1" />
              Create Task
            </Link>
          </Button>
        </div>
      </div>
      
      {isFilterOpen && (
        <div className="p-4 rounded-lg border bg-card animate-fade-in">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-2">Status</h3>
              <RadioGroup 
                defaultValue={filter.status} 
                onValueChange={handleStatusChange}
                className="flex flex-wrap gap-2"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="all" id="status-all" />
                  <Label htmlFor="status-all">All</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="backlog" id="status-backlog" />
                  <Label htmlFor="status-backlog">Backlog</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="todo" id="status-todo" />
                  <Label htmlFor="status-todo">To Do</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="in-progress" id="status-progress" />
                  <Label htmlFor="status-progress">In Progress</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="in-review" id="status-review" />
                  <Label htmlFor="status-review">In Review</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="completed" id="status-completed" />
                  <Label htmlFor="status-completed">Completed</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Priority</h3>
              <RadioGroup 
                defaultValue={filter.priority} 
                onValueChange={handlePriorityChange}
                className="flex flex-wrap gap-2"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="all" id="priority-all" />
                  <Label htmlFor="priority-all">All</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="low" id="priority-low" />
                  <Label htmlFor="priority-low">Low</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="medium" id="priority-medium" />
                  <Label htmlFor="priority-medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="high" id="priority-high" />
                  <Label htmlFor="priority-high">High</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="urgent" id="priority-urgent" />
                  <Label htmlFor="priority-urgent">Urgent</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      )}
      
      {error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-red-100 text-red-600 p-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">{error}</h3>
          <p className="text-muted-foreground max-w-md mt-2">
            Please try refreshing the page or adjusting your filters.
          </p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M12 18v-6" />
              <path d="M8 18v-1" />
              <path d="M16 18v-3" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">No tasks found</h3>
          <p className="text-muted-foreground max-w-md">
            {filter.status !== 'all' || filter.priority !== 'all' || filter.search
              ? "Try adjusting your filters to see more results."
              : "Start by creating your first task."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};