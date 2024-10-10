// src/contexts/TimerContext.tsx

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface TimerContextProps {
  timeLeft: number | null; // Remaining time in seconds
  setScheduledTime: (scheduledTime: string | null) => void; // Set the scheduled dispatch time
}

const TimerContext = createContext<TimerContextProps>({
  timeLeft: null,
  setScheduledTime: () => {},
});

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scheduledTime, setScheduledTimeState] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Function to set the scheduled dispatch time
  const setScheduledTime = (scheduledTime: string | null) => {
    setScheduledTimeState(scheduledTime);
  };

  useEffect(() => {
    // Function to update the remaining time
    const updateTimeLeft = () => {
      if (!scheduledTime) {
        setTimeLeft(null);
        return;
      }

      const scheduledDate = new Date(scheduledTime);
      const now = new Date();
      const diffInSeconds = Math.floor((scheduledDate.getTime() - now.getTime()) / 1000);

      if (diffInSeconds > 0) {
        setTimeLeft(diffInSeconds);
      } else {
        setTimeLeft(0);
        // Clear the interval if time has elapsed
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
          timerInterval.current = null;
        }
      }
    };

    // Initial call to set the timeLeft
    updateTimeLeft();

    // Clear any existing intervals
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }

    if (scheduledTime) {
      // Update every second
      timerInterval.current = setInterval(updateTimeLeft, 1000);
    }

    // Cleanup on unmount or when scheduledTime changes
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    };
  }, [scheduledTime]);

  return (
    <TimerContext.Provider value={{ timeLeft, setScheduledTime }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
