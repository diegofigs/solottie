import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface PoolConfigFields {
  assets: Array<PublicKey>
  bump: number
}

export interface PoolConfigJSON {
  assets: Array<string>
  bump: number
}

export class PoolConfig {
  readonly assets: Array<PublicKey>
  readonly bump: number

  static readonly discriminator = Buffer.from([
    26, 108, 14, 123, 116, 230, 129, 43,
  ])

  static readonly layout = borsh.struct([
    borsh.vec(borsh.publicKey(), "assets"),
    borsh.u8("bump"),
  ])

  constructor(fields: PoolConfigFields) {
    this.assets = fields.assets
    this.bump = fields.bump
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<PoolConfig | null> {
    const info = await c.getAccountInfo(address)

    if (info === null) {
      return null
    }
    if (!info.owner.equals(programId)) {
      throw new Error("account doesn't belong to this program")
    }

    return this.decode(info.data)
  }

  static async fetchMultiple(
    c: Connection,
    addresses: PublicKey[],
    programId: PublicKey = PROGRAM_ID
  ): Promise<Array<PoolConfig | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses)

    return infos.map((info) => {
      if (info === null) {
        return null
      }
      if (!info.owner.equals(programId)) {
        throw new Error("account doesn't belong to this program")
      }

      return this.decode(info.data)
    })
  }

  static decode(data: Buffer): PoolConfig {
    if (!data.slice(0, 8).equals(PoolConfig.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = PoolConfig.layout.decode(data.slice(8))

    return new PoolConfig({
      assets: dec.assets,
      bump: dec.bump,
    })
  }

  toJSON(): PoolConfigJSON {
    return {
      assets: this.assets.map((item) => item.toString()),
      bump: this.bump,
    }
  }

  static fromJSON(obj: PoolConfigJSON): PoolConfig {
    return new PoolConfig({
      assets: obj.assets.map((item) => new PublicKey(item)),
      bump: obj.bump,
    })
  }
}
