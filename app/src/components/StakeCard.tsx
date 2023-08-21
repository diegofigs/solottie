import { PublicKey } from "@solana/web3.js";
import { useTokenBalance } from "hooks/useTokenBalance";
import { LotteryPool } from "program/accounts";
import { useState } from "react";
import { Stake } from "./Stake";
import { TokenInput } from "./TokenInput";
import { Unstake } from "./Unstake";

type StakeCardProps = { pool: LotteryPool; id: PublicKey };
export function StakeCard({ pool, id }: StakeCardProps) {
  const tokenBalance = useTokenBalance(pool.mint);
  const [amount, setAmount] = useState("");
  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md bg-primary text-white">
      <div className="p-4">
        <div className="my-2">
          <h1 className="text-2xl sm:text-3xl">
            {pool.startedAt === null && "Stake for a chance to win!"}
            {pool.startedAt !== null && pool.settledAt === null && "Lottery Pool in Progress"}
            {pool.startedAt !== null && pool.settledAt !== null && "Lottery Pool Settled"}
          </h1>
          <p className="text-md">
            Methodology: sources the conversion rate of LST on start and
            settlement, treating the difference as yield for the winner and
            returning equal deposit value to all losers.
          </p>
        </div>
        {pool.startedAt === null && (
          <>
            <div className="flex justify-center items-center">
              <TokenInput
                label="bSOL"
                mint={pool.mint.toString()}
                balance={tokenBalance ? tokenBalance.value.uiAmount : 0}
                value={amount}
                onInputChange={(value) => setAmount(value)}
              />
            </div>
            <div className="w-full flex flex-row justify-center items-center">
              <Stake id={id} mint={pool.mint} amount={amount} />
            </div>
          </>
        )}
        {pool.startedAt !== null && pool.settledAt !== null && (
          <div className="w-full flex flex-row justify-center items-center">
            <Unstake id={id} mint={pool.mint} />
          </div>
        )}
      </div>
    </div>
  );
}
