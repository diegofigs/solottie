import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function useTokenBalance(mint: PublicKey) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { data } = useQuery({
    queryKey: [
      "tokenBalance",
      mint.toString(),
      wallet.publicKey ? wallet.publicKey.toString() : "",
    ],
    queryFn: async () => {
      if (wallet.publicKey) {
        const ata = getAssociatedTokenAddressSync(mint, wallet.publicKey);
        return connection.getTokenAccountBalance(ata);
      }
      return null;
    },
  });
  return data;
}
