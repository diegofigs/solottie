import { clusterApiUrl, PublicKey } from "@solana/web3.js";

export const LOCALNET = "http://127.0.0.1:8899";
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl("devnet");

export const CONFIG_SEED = "config";
export const STAKE_POOL_SEED = "stake_pool";
export const TICKET_SEED = "ticket";
export const TOKEN_SEED = "token";
export const BLAZESTAKE_POOL = new PublicKey(
  "stk9ApL5HeVAwPLr3TLhDXdZS8ptVu7zp6ov8HFDuMi"
);
export const BSOL = new PublicKey(
  "bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1"
);

export const MSOL = new PublicKey(
  "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"
);

export const BSOL_TO_SOL_FEED = new PublicKey(
  "2yWjZ439MMEtAZZxk4RC2C9GB71fHaWHYm82943CvNBy"
);
export const BSOL_TO_SOL_DEVNET_FEED = new PublicKey(
  "6SKYzyMTHUpoma6Qt6KfRu1aBYGBGiWRYp4XRSEzixgA"
);

export const TEST_FEED = new PublicKey(
  "BYFujDbDYYwxdyPnxm43uan4g4CcMUVtBuw3DHJUonEn"
);
