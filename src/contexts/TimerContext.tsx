import React, {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect,
  } from 'react';

  interface TimerContextProps {
    timeLeft: number | null;
    setScheduledTime: (
      dispatcherResponseTime: string | null,
      scheduledTime: string | null
    ) => void;
  }

  const TimerContext = createContext<TimerContextProps>({
    timeLeft: null,
    setScheduledTime: () => {},
  });

  export const TimerProvider: React.FC<{children: React.ReactNode}> = ({
    children,
  }) => {
    const [dispatcherResponseTime, setDispatcherResponseTime] = useState<string | null>(null);
    const [scheduledTime, setScheduledTimeState] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const timerInterval = useRef<NodeJS.Timeout | null>(null);

    const setScheduledTime = (responseTime: string | null, scheduleTime: string | null) => {
      setDispatcherResponseTime(responseTime);
      setScheduledTimeState(scheduleTime);
    };

    useEffect(() => {
      const updateTimeLeft = () => {
        if (!dispatcherResponseTime || !scheduledTime) {
          setTimeLeft(null);
          return;
        }

        const responseDate = new Date(dispatcherResponseTime);
        const scheduledDate = new Date(scheduledTime);

        // Ensure scheduled time is exactly 10 minutes after response time
        const expectedScheduledTime = new Date(responseDate.getTime() + 10 * 60000);

        // If the scheduled time differs, use the backend-specified one
        if (expectedScheduledTime.getTime() !== scheduledDate.getTime()) {
          console.warn("Scheduled time does not match expected 10 minutes after response time.");
        }

        // Get the time remaining from the current time (use scheduled dispatch time)
        const now = new Date();
        const diffInSeconds = Math.floor((scheduledDate.getTime() - now.getTime()) / 1000);

        if (diffInSeconds > 0) {
          setTimeLeft(diffInSeconds);
        } else {
          setTimeLeft(0);
          if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
          }
        }
      };

      updateTimeLeft();

      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }

      if (dispatcherResponseTime && scheduledTime) {
        timerInterval.current = setInterval(updateTimeLeft, 1000);
      }

      return () => {
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
          timerInterval.current = null;
        }
      };
    }, [dispatcherResponseTime, scheduledTime]);

    return (
      <TimerContext.Provider value={{timeLeft, setScheduledTime}}>
        {children}
      </TimerContext.Provider>
    );
  };

  export const useTimer = () => useContext(TimerContext);
