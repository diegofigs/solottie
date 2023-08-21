import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface ClosePoolAccounts {
  signer: PublicKey
  lotteryPool: PublicKey
}

export function closePool(
  accounts: ClosePoolAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.signer, isSigner: true, isWritable: true },
    { pubkey: accounts.lotteryPool, isSigner: false, isWritable: true },
  ]
  const identifier = Buffer.from([140, 189, 209, 23, 239, 62, 239, 11])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
