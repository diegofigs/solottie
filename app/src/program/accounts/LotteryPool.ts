import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface LotteryPoolFields {
  mint: PublicKey;
  startTime: BN;
  endTime: BN;
  startedAt: BN | null;
  settledAt: BN | null;
  startRate: BN | null;
  endRate: BN | null;
  holders: Array<PublicKey>;
  amounts: Array<BN>;
  supply: BN;
  winner: PublicKey | null;
  bump: number;
  switchboardAggregator: PublicKey;
}

export interface LotteryPoolJSON {
  mint: string;
  startTime: string;
  endTime: string;
  startedAt: string | null;
  settledAt: string | null;
  startRate: string | null;
  endRate: string | null;
  holders: Array<string>;
  amounts: Array<string>;
  supply: string;
  winner: string | null;
  bump: number;
  switchboardAggregator: string;
}

export class LotteryPool {
  readonly mint: PublicKey;
  readonly startTime: BN;
  readonly endTime: BN;
  readonly startedAt: BN | null;
  readonly settledAt: BN | null;
  readonly startRate: BN | null;
  readonly endRate: BN | null;
  readonly holders: Array<PublicKey>;
  readonly amounts: Array<BN>;
  readonly supply: BN;
  readonly winner: PublicKey | null;
  readonly bump: number;
  readonly switchboardAggregator: PublicKey;

  static readonly discriminator = Buffer.from([
    96, 45, 253, 200, 241, 39, 133, 245,
  ]);

  static readonly layout = borsh.struct([
    borsh.publicKey("mint"),
    borsh.i64("startTime"),
    borsh.i64("endTime"),
    borsh.option(borsh.i64(), "startedAt"),
    borsh.option(borsh.i64(), "settledAt"),
    borsh.option(borsh.u64(), "startRate"),
    borsh.option(borsh.u64(), "endRate"),
    borsh.vec(borsh.publicKey(), "holders"),
    borsh.vec(borsh.u64(), "amounts"),
    borsh.u64("supply"),
    borsh.option(borsh.publicKey(), "winner"),
    borsh.u8("bump"),
    borsh.publicKey("switchboardAggregator"),
  ]);

  constructor(fields: LotteryPoolFields) {
    this.mint = fields.mint;
    this.startTime = fields.startTime;
    this.endTime = fields.endTime;
    this.startedAt = fields.startedAt;
    this.settledAt = fields.settledAt;
    this.startRate = fields.startRate;
    this.endRate = fields.endRate;
    this.holders = fields.holders;
    this.amounts = fields.amounts;
    this.supply = fields.supply;
    this.winner = fields.winner;
    this.bump = fields.bump;
    this.switchboardAggregator = fields.switchboardAggregator;
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<LotteryPool | null> {
    const info = await c.getAccountInfo(address);

    if (info === null) {
      return null;
    }
    if (!info.owner.equals(programId)) {
      throw new Error("account doesn't belong to this program");
    }

    return this.decode(info.data);
  }

  static async fetchMultiple(
    c: Connection,
    addresses: PublicKey[],
    programId: PublicKey = PROGRAM_ID
  ): Promise<Array<LotteryPool | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses);

    return infos.map((info) => {
      if (info === null) {
        return null;
      }
      if (!info.owner.equals(programId)) {
        throw new Error("account doesn't belong to this program");
      }

      return this.decode(info.data);
    });
  }

  static decode(data: Buffer): LotteryPool {
    if (!data.slice(0, 8).equals(LotteryPool.discriminator)) {
      throw new Error("invalid account discriminator");
    }

    const dec = LotteryPool.layout.decode(data.slice(8));

    return new LotteryPool({
      mint: dec.mint,
      startTime: dec.startTime,
      endTime: dec.endTime,
      startedAt: dec.startedAt,
      settledAt: dec.settledAt,
      startRate: dec.startRate,
      endRate: dec.endRate,
      holders: dec.holders,
      amounts: dec.amounts,
      supply: dec.supply,
      winner: dec.winner,
      bump: dec.bump,
      switchboardAggregator: dec.switchboardAggregator,
    });
  }

  toJSON(): LotteryPoolJSON {
    return {
      mint: this.mint.toString(),
      startTime: this.startTime.toString(),
      endTime: this.endTime.toString(),
      startedAt: (this.startedAt && this.startedAt.toString()) || null,
      settledAt: (this.settledAt && this.settledAt.toString()) || null,
      startRate: (this.startRate && this.startRate.toString()) || null,
      endRate: (this.endRate && this.endRate.toString()) || null,
      holders: this.holders.map((item) => item.toString()),
      amounts: this.amounts.map((item) => item.toString()),
      supply: this.supply.toString(),
      winner: (this.winner && this.winner.toString()) || null,
      bump: this.bump,
      switchboardAggregator: this.switchboardAggregator.toString(),
    };
  }

  static fromJSON(obj: LotteryPoolJSON): LotteryPool {
    return new LotteryPool({
      mint: new PublicKey(obj.mint),
      startTime: new BN(obj.startTime),
      endTime: new BN(obj.endTime),
      startedAt: (obj.startedAt && new BN(obj.startedAt)) || null,
      settledAt: (obj.settledAt && new BN(obj.settledAt)) || null,
      startRate: (obj.startRate && new BN(obj.startRate)) || null,
      endRate: (obj.endRate && new BN(obj.endRate)) || null,
      holders: obj.holders.map((item) => new PublicKey(item)),
      amounts: obj.amounts.map((item) => new BN(item)),
      supply: new BN(obj.supply),
      winner: (obj.winner && new PublicKey(obj.winner)) || null,
      bump: obj.bump,
      switchboardAggregator: new PublicKey(obj.switchboardAggregator),
    });
  }
}
