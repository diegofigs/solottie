import React from "react";

type LotteryStatusProps = {
  startTime: Date;
  endTime: Date;
  startedAt: Date | null;
  settledAt: Date | null;
};

function LotteryStatus({
  startTime,
  endTime,
  startedAt,
  settledAt,
}: LotteryStatusProps) {
  const now = new Date();

  let status = "";
  let colorClass = "";

  if (now < startTime) {
    status = "Waiting";
    colorClass = "bg-red-500";
  } else if (now >= startTime && now < endTime) {
    status = startedAt === null ? "Waiting to Start" : "In Progress";
    colorClass = "bg-yellow-500";
  } else {
    status = settledAt === null ? "Waiting to Settle" : "Settled";
    colorClass = "bg-green-500";
  }

  return (
    <span className={`text-white px-4 py-1 rounded-full text-sm ${colorClass}`}>
      {status}
    </span>
  );
}

export default LotteryStatus;
