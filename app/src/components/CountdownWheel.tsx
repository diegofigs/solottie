import React, { useEffect, useMemo, useState } from "react";
import { differenceInSeconds } from "date-fns";

type CountdownWheelProps = {
  startTime: Date;
  endTime: Date;
};

function CountdownWheel({ startTime, endTime }: CountdownWheelProps) {
  const now = useMemo(() => new Date(), []);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    differenceInSeconds(now < startTime ? startTime : endTime, now)
  );
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = (secondsRemaining / (24 * 60 * 60)) * circumference;

  useEffect(() => {
    const intervalId = setInterval(() => {
      const secondsDiff = differenceInSeconds(
        now < startTime ? startTime : endTime,
        new Date()
      );
      setSecondsRemaining(secondsDiff > 0 ? secondsDiff : 0);
      if (secondsDiff <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [now, endTime, startTime]);

  const color = now < startTime ? "red" : now < endTime ? "yellow" : "green";
  return (
    <div className="countdown-wheel">
      <svg width="120" height="120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="lightgray"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
        />
        <text
          x="60"
          y="60"
          textAnchor="middle"
          fill="white"
          dy=".3em"
        >{`${Math.floor(secondsRemaining / 3600)}h ${Math.floor(
          (secondsRemaining % 3600) / 60
        )}m`}</text>
      </svg>
    </div>
  );
}

export default CountdownWheel;
