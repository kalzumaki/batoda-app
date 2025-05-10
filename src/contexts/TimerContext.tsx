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

            // Convert backend timestamps to Date objects
            const scheduledDate = new Date(scheduledTime);

            // Get time remaining from now
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
