import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { RPC_URL } from "config";
import { IDL } from "models/lottie";
import { PROGRAM_ID } from "program/programId";

export async function getLotteryPoolIds() {
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
  const pools = await program.account.lotteryPool.all();
  return pools.map((p) => p.publicKey);
}
