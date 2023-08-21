import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface CreatePoolArgs {
  startTime: BN
  endTime: BN
  tokenName: string
}

export interface CreatePoolAccounts {
  signer: PublicKey
  lotteryPool: PublicKey
  /** Stake Token account holds token deposits. */
  stakeToken: PublicKey
  /** Ticket Mint account represents stake receipts. */
  ticketMint: PublicKey
  ticketMintMetadata: PublicKey
  /** Mint account is the stakeable token. */
  mint: PublicKey
  switchboardAggregator: PublicKey
  tokenMetadataProgram: PublicKey
  tokenProgram: PublicKey
  systemProgram: PublicKey
  rent: PublicKey
}

export const layout = borsh.struct([
  borsh.i64("startTime"),
  borsh.i64("endTime"),
  borsh.str("tokenName"),
])

export function createPool(
  args: CreatePoolArgs,
  accounts: CreatePoolAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.signer, isSigner: true, isWritable: true },
    { pubkey: accounts.lotteryPool, isSigner: false, isWritable: true },
    { pubkey: accounts.stakeToken, isSigner: false, isWritable: true },
    { pubkey: accounts.ticketMint, isSigner: false, isWritable: true },
    { pubkey: accounts.ticketMintMetadata, isSigner: false, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    {
      pubkey: accounts.switchboardAggregator,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: accounts.tokenMetadataProgram,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([233, 146, 209, 142, 207, 104, 64, 188])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      startTime: args.startTime,
      endTime: args.endTime,
      tokenName: args.tokenName,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
