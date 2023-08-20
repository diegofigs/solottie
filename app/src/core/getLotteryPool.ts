import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { RPC_URL } from "config";
import { IDL } from "models/lottie";
import { LotteryPool } from "program/accounts";
import { PROGRAM_ID } from "program/programId";

export async function getLotteryPool(address: PublicKey) {
  const provider = new AnchorProvider(
    new Connection(RPC_URL),
    {
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any[]) => txs,
      publicKey: PublicKey.unique(),
    },
    AnchorProvider.defaultOptions()
  );
  const program = new Program(IDL, PROGRAM_ID, provider);
  const pool = await program.account.lotteryPool.fetch(address);
  return new LotteryPool(pool).toJSON();
}
