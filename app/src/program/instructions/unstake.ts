import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UnstakeAccounts {
  signer: PublicKey;
  lotteryPool: PublicKey;
  stakeToken: PublicKey;
  userToken: PublicKey;
  userTicket: PublicKey;
  ticketMint: PublicKey;
  mint: PublicKey;
  tokenProgram: PublicKey;
  associatedTokenProgram: PublicKey;
}

export function unstake(
  accounts: UnstakeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.signer, isSigner: true, isWritable: true },
    { pubkey: accounts.lotteryPool, isSigner: false, isWritable: true },
    { pubkey: accounts.stakeToken, isSigner: false, isWritable: true },
    { pubkey: accounts.userToken, isSigner: false, isWritable: true },
    { pubkey: accounts.userTicket, isSigner: false, isWritable: true },
    { pubkey: accounts.ticketMint, isSigner: false, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    {
      pubkey: accounts.associatedTokenProgram,
      isSigner: false,
      isWritable: false,
    },
  ];
  const identifier = Buffer.from([90, 95, 107, 42, 205, 124, 50, 225]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
