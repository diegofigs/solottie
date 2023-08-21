import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface StakeArgs {
  amount: BN
}

export interface StakeAccounts {
  signer: PublicKey
  /** Lottery Pool account stores pool metadata. */
  lotteryPool: PublicKey
  /** Stake Token account holds token deposits. */
  stakeToken: PublicKey
  /** User Token account is used to transfer tokens from. */
  userToken: PublicKey
  /** User Ticket account is used to transfer tickets to. */
  userTicket: PublicKey
  /** Ticket Mint account represents stake receipts. */
  ticketMint: PublicKey
  /** Mint account is the stakeable token. */
  mint: PublicKey
  tokenProgram: PublicKey
  associatedTokenProgram: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([borsh.u64("amount")])

export function stake(
  args: StakeArgs,
  accounts: StakeAccounts,
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
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([206, 176, 202, 18, 200, 209, 179, 108])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      amount: args.amount,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
