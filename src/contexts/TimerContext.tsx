// src/context/TimerContext.tsx

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface TimerContextProps {
  timeLeft: number;
  resetTimer: () => void;
  startTimer: () => void;
}

const TimerContext = createContext<TimerContextProps | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (countdownInterval.current) return; // Prevent multiple intervals

    countdownInterval.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(countdownInterval.current as NodeJS.Timeout);
          countdownInterval.current = null;
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const resetTimer = () => {
    setTimeLeft(600); // Reset to 10 minutes
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, []);

  return (
    <TimerContext.Provider value={{ timeLeft, resetTimer, startTimer }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
