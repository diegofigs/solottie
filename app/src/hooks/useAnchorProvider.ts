import { AnchorProvider } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export function useAnchorProvider() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [provider, setProvider] = useState<AnchorProvider>();

  // const [isMounted, setIsMounted] = useState(false);
  // useEffect(() => {
  //   setIsMounted(true);
  // }, []);

  useEffect(() => {
    setProvider(
      new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions())
    );
  }, [connection, wallet]);

  return provider;
}
