import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface StaleFeedJSON {
  kind: "StaleFeed"
}

export class StaleFeed {
  static readonly discriminator = 0
  static readonly kind = "StaleFeed"
  readonly discriminator = 0
  readonly kind = "StaleFeed"

  toJSON(): StaleFeedJSON {
    return {
      kind: "StaleFeed",
    }
  }

  toEncodable() {
    return {
      StaleFeed: {},
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.FeedErrorCodeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object")
  }

  if ("StaleFeed" in obj) {
    return new StaleFeed()
  }

  throw new Error("Invalid enum object")
}

export function fromJSON(
  obj: types.FeedErrorCodeJSON
): types.FeedErrorCodeKind {
  switch (obj.kind) {
    case "StaleFeed": {
      return new StaleFeed()
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([borsh.struct([], "StaleFeed")])
  if (property !== undefined) {
    return ret.replicate(property)
  }
  return ret
}
