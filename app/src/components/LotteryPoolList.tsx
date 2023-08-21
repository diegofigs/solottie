import { useQuery } from "@tanstack/react-query";
import { getAllLotteryPools } from "core/getAllLotteryPools";
import { LotteryPool, LotteryPoolJSON } from "program/accounts";
import { LotteryPoolCard } from "./LotteryPoolCard";

type LotteryPoolListProps = {
  pools?: LotteryPoolJSON[];
};

export function LotteryPoolList({ pools }: LotteryPoolListProps) {
  const { data: lotteryPools } = useQuery({
    queryKey: ["lotteryPool"],
    queryFn: getAllLotteryPools,
    initialData: pools,
  });

  return (
    <div className="max-w-screen-lg w-full">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {lotteryPools.map(LotteryPool.fromJSON).map((pool, i) => (
          <LotteryPoolCard key={`pool-${i}`} pool={pool} navigation />
        ))}
      </div>
    </div>
  );
}
