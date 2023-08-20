import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface StartAccounts {
  signer: PublicKey;
  /** Lottery Pool account stores pool metadata. */
  lotteryPool: PublicKey;
  /** Mint account is the stakeable token. */
  mint: PublicKey;
  switchboardAggregator: PublicKey;
}

export function start(
  accounts: StartAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.signer, isSigner: true, isWritable: true },
    { pubkey: accounts.lotteryPool, isSigner: false, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    {
      pubkey: accounts.switchboardAggregator,
      isSigner: false,
      isWritable: false,
    },
  ];
  const identifier = Buffer.from([62, 15, 117, 236, 47, 1, 89, 139]);
  const data = identifier;
  const ix = new TransactionInstruction({ keys, programId, data });
  return ix;
}
