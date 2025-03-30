
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTaskStore } from '@/lib/store';
import { formatDistance } from 'date-fns';

interface TimeTrackerProps {
  taskId: string;
}

export const TimeTracker: React.FC<TimeTrackerProps> = ({ taskId }) => {
  const { tasks, startTimeTracking, stopTimeTracking, getTaskTotalTime } = useTaskStore();
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const task = tasks.find(t => t.id === taskId);
  
  useEffect(() => {
    if (!task) return;
    
    // Check if there's an active time record
    const activeRecord = task.timeRecords.find(record => record.endTime === null);
    setIsTracking(!!activeRecord);
    
    // Set initial elapsed time
    setElapsedTime(getTaskTotalTime(taskId));
    
    // Update elapsed time every second if tracking
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedTime(getTaskTotalTime(taskId));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [task, taskId, isTracking, getTaskTotalTime]);
  
  const handleToggleTracking = () => {
    if (isTracking) {
      stopTimeTracking(taskId);
      setIsTracking(false);
    } else {
      startTimeTracking(taskId);
      setIsTracking(true);
    }
  };
  
  const formatTime = (ms: number): string => {
    if (ms < 60000) {
      return 'Less than a minute';
    }
    
    return formatDistance(0, ms, { includeSeconds: false });
  };
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="text-sm font-medium flex justify-between items-center">
        <span>Time Tracked</span>
        <span className={`font-mono ${isTracking ? 'text-accent animate-pulse' : ''}`}>
          {formatTime(elapsedTime)}
        </span>
      </div>
      <Button 
        onClick={handleToggleTracking}
        variant={isTracking ? "destructive" : "default"}
        size="sm"
        className="w-full transition-all duration-300"
      >
        {isTracking ? 'Stop Tracking' : 'Start Tracking'}
      </Button>
    </div>
  );
};