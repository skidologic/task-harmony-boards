
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatusBadge } from '@/components/tasks/StatusBadge';
import { useTaskStore } from '@/lib/store';
import { Task } from '@/types';
import { CalendarDays, Plus } from 'lucide-react';

const CalendarView: React.FC = () => {
  const { tasks } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Group tasks by their deadline date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      if (task.deadline) {
        try {
          // Ensure deadline is a Date object
          const deadlineDate = task.deadline instanceof Date 
            ? task.deadline 
            : new Date(task.deadline);
          
          // Format date as YYYY-MM-DD for grouping
          const dateKey = format(deadlineDate, 'yyyy-MM-dd');
          
          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          
          grouped[dateKey].push(task);
        } catch (error) {
          console.error(`Error processing deadline for task ${task.id}:`, error);
        }
      }
    });
    
    return grouped;
  }, [tasks]);
  
  // Get tasks for the selected date
  const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const tasksForSelectedDate = tasksByDate[selectedDateKey] || [];
  
  // Calculate days with tasks for highlighting in the calendar
  const daysWithTasks = useMemo(() => {
    return Object.keys(tasksByDate).map(dateStr => new Date(dateStr));
  }, [tasksByDate]);
  
  // Custom day rendering for the calendar to show task indicators
  const renderDay = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const tasksForDay = tasksByDate[dateKey] || [];
    const hasUrgentTask = tasksForDay.some(task => task.priority === 'urgent');
    const hasHighTask = tasksForDay.some(task => task.priority === 'high');
    
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {day.getDate()}
        {tasksForDay.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5 pb-1">
            <div className={`h-1 w-1 rounded-full ${
              hasUrgentTask ? 'bg-red-500' : 
              hasHighTask ? 'bg-amber-500' : 
              'bg-blue-500'
            }`} />
            {tasksForDay.length > 1 && (
              <div className="h-1 w-1 rounded-full bg-gray-400" />
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar View</h1>
          <p className="text-muted-foreground">
            View and manage your tasks by deadline date.
          </p>
        </div>
        <Button asChild>
          <Link to="/tasks/new">
            <Plus className="mr-2 h-4 w-4" /> New Task
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarDays className="mr-2 h-5 w-5" /> Calendar
            </CardTitle>
            <CardDescription>
              Select a date to view tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              components={{
                DayContent: ({ date, ...props }) => renderDay(date)
              }}
              modifiersClassNames={{
                selected: 'bg-primary text-primary-foreground',
                today: 'bg-accent text-accent-foreground'
              }}
              className="w-full"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
            </CardTitle>
            <CardDescription>
              {tasksForSelectedDate.length === 0 
                ? 'No tasks scheduled for this date' 
                : `${tasksForSelectedDate.length} task${tasksForSelectedDate.length === 1 ? '' : 's'} scheduled`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasksForSelectedDate.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No tasks scheduled for this date.</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" /> Add Task for {selectedDate ? format(selectedDate, 'MMM d') : 'This Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Quick Add Task</h4>
                      <p className="text-sm text-muted-foreground">
                        Use the full form for more options:
                      </p>
                      <Button asChild className="w-full">
                        <Link to="/tasks/new">Create New Task</Link>
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="space-y-4">
                {tasksForSelectedDate.map(task => (
                  <Link 
                    key={task.id} 
                    to={`/tasks/${task.id}`}
                    className="block p-4 rounded-lg border hover:border-primary transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <StatusBadge status={task.status} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <div className={`px-2 py-1 rounded-full ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        task.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                        task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </div>
                      <div>
                        {task.assignee && `Assigned to: ${task.assignee}`}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;