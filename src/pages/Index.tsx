
import React from 'react';
import { Link } from 'react-router-dom';
import { useTaskStore } from '@/lib/store';
import { TaskList } from '@/components/tasks/TaskList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/tasks/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const TasksOverview: React.FC = () => {
  const { tasks } = useTaskStore();
  
  // Count tasks by status
  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo').length,
    'in-progress': tasks.filter(task => task.status === 'in-progress').length,
    'in-review': tasks.filter(task => task.status === 'in-review').length,
    completed: tasks.filter(task => task.status === 'completed').length,
    backlog: tasks.filter(task => task.status === 'backlog').length,
  };
  
  // Get tasks with upcoming deadlines (next 3 days)
  const today = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(today.getDate() + 3);
  
  const upcomingDeadlines = tasks
    .filter(task => 
      task.deadline && 
      task.deadline >= today && 
      task.deadline <= threeDaysFromNow &&
      task.status !== 'completed'
    )
    .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime());
  
  // For demo purposes, check if we have any tasks
  const hasTasks = tasks.length > 0;
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design Team Dashboard</h1>
          <p className="text-muted-foreground">
            Track and manage all design tasks from one central place.
          </p>
        </div>
        
        <Button asChild size="default" className="hidden sm:flex">
          <Link to="/tasks/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Link>
        </Button>
      </div>
      
      {!hasTasks ? (
        <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 12H3" />
              <path d="M16 6H3" />
              <path d="M16 18H3" />
              <path d="M18 9v6" />
              <path d="M21 12h-6" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Welcome to Design Tasks</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            This is your design team's task management hub. Get started by creating your first task.
          </p>
          <Button asChild size="lg">
            <Link to="/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Task
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-5">
            {[
              { label: 'To Do', status: 'todo', count: tasksByStatus.todo },
              { label: 'In Progress', status: 'in-progress', count: tasksByStatus['in-progress'] },
              { label: 'In Review', status: 'in-review', count: tasksByStatus['in-review'] },
              { label: 'Completed', status: 'completed', count: tasksByStatus.completed },
              { label: 'Backlog', status: 'backlog', count: tasksByStatus.backlog },
            ].map(item => (
              <Card key={item.status} className="glass-card dark:glass-dark animate-scale-in">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.label}
                  </CardTitle>
                  <StatusBadge status={item.status as any} className="ml-auto" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.count}</div>
                  <p className="text-xs text-muted-foreground">
                    {item.count === 1 ? 'task' : 'tasks'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {upcomingDeadlines.length > 0 && (
            <Card className="glass-card dark:glass-dark animate-fade-in">
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Tasks due in the next 3 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDeadlines.map(task => (
                    <div key={task.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          task.priority === 'urgent' ? 'bg-red-500' :
                          task.priority === 'high' ? 'bg-amber-500' :
                          task.priority === 'medium' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                        <Link 
                          to={`/tasks/${task.id}`} 
                          className="font-medium hover:text-accent transition-colors"
                        >
                          {task.title}
                        </Link>
                      </div>
                      <div className="text-sm">
                        {task.deadline!.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <TaskList />
        </>
      )}
    </div>
  );
};

export default TasksOverview;
