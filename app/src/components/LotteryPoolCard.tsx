import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { STAKE_POOL_SEED } from "config";
import { LotteryPool } from "program/accounts";
import { PROGRAM_ID } from "program/programId";
import Image from "next/image";
import Link from "next/link";
import CountdownWheel from "./CountdownWheel";
import LotteryStatus from "./LotteryStatus";
import { format } from "date-fns";
import { Start } from "./Start";
import { Settle } from "./Settle";

type LotteryPoolCardProps = {
  pool: LotteryPool;
  navigation?: boolean;
  crank?: boolean;
};
export const LotteryPoolCard = ({
  pool,
  navigation = false,
  crank = false,
}: LotteryPoolCardProps) => {
  const [poolPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from(STAKE_POOL_SEED),
      Buffer.from(pool.startTime.toArray("le", 8)),
      Buffer.from(pool.endTime.toArray("le", 8)),
      pool.mint.toBuffer(),
    ],
    PROGRAM_ID
  );
  const startDate = new Date(pool.startTime.toNumber() * 1000);
  const endDate = new Date(pool.endTime.toNumber() * 1000);

  const start = format(startDate, "MM/dd/yyyy");
  const end = format(endDate, "MM/dd/yyyy");
  const now = new Date();
  return (
    <div
      key={poolPDA.toString()}
      className="w-full rounded-lg overflow-hidden shadow-md bg-primary text-white"
    >
      <div className="p-4">
        <div className="w-full flex justify-between items-center gap-2">
          <h2 className="text-xl truncate">Lottery</h2>
          <LotteryStatus startTime={startDate} endTime={endDate} />
          {/* Replace with your icon */}
        </div>
        <div className="flex items-center gap-1">
          <h3 className="text-md truncate">{`Mint: ${truncateAddress(
            pool.mint.toString()
          )}`}</h3>
          <Image
            src={`https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${pool.mint.toString()}/logo.png`}
            alt="Icon"
            width={24}
            height={24}
          />
        </div>
        <div className="flex flex-row justify-between items-center">
          <div>
            <p>Start Time: {startDate.toLocaleString()}</p>
            <p>End Time: {endDate.toLocaleString()}</p>
            <p>Participants: {pool.holders.length}</p>
            <p>Tickets Sold: {pool.supply.toNumber() / LAMPORTS_PER_SOL}</p>
          </div>
          <CountdownWheel startTime={startDate} endTime={endDate} />
        </div>
        {navigation && (
          <div className="flex justify-center mt-4">
            <div className="flex flex-row justify-center">
              <div className="relative group items-center">
                <div
                  className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"
                ></div>
                <Link
                  href={`/pools/${poolPDA.toString()}`}
                  className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                >
                  <span className="block w-full group-disabled:hidden">
                    Stake
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
        {crank && (
          <div>
            {startDate.getTime() < now.getTime() && pool.startedAt === null && (
              <Start
                id={poolPDA}
                mint={pool.mint}
                switchboardAggregator={pool.switchboardAggregator}
              />
            )}
            {endDate.getTime() < now.getTime() &&
              pool.startedAt !== null &&
              pool.settledAt === null && (
                <Settle
                  id={poolPDA}
                  mint={pool.mint}
                  switchboardAggregator={pool.switchboardAggregator}
                />
              )}
          </div>
        )}
      </div>
    </div>
  );
};

function truncateAddress(address: string, length: number = 4): string {
  if (address.length <= length * 2) {
    // Return the full address if it's short enough
    return address;
  }

  // Return the truncated address
  return (
    address.substring(0, length) +
    "..." +
    address.substring(address.length - length)
  );
}
