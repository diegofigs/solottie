import React, { useMemo, useState } from "react";
import { CreateLottery } from "./CreateLottery";
import InfiniteCalendar, { Calendar, withRange } from "react-infinite-calendar";
import "react-infinite-calendar/styles.css";

export function CreateLotteryForm() {
  const today = useMemo(() => new Date(), []);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);

  return (
    <div className="flex flex-col p-2">
      <CreateLottery startTime={new Date().getTime()} endTime={end.getTime()} />
      <InfiniteCalendar
        Component={withRange(Calendar)}
        width={300}
        height={300}
        selected={{
          start,
          end,
        }}
        disabledDays={[]}
        minDate={today}
        onSelect={(value: any) => {
          if (value.eventType === 3) {
            setStart(value.start);
            setEnd(value.end);
          }
        }}
        displayOptions={{
          showHeader: false,
        }}
      />
      ,
    </div>
  );
}
