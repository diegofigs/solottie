import {
  Metadata,
  MetadataProgram,
} from "@metaplex-foundation/mpl-token-metadata";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { WalletError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionMessage,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { BN } from "bn.js";
import {
  TICKET_SEED,
  // CONFIG_SEED,
  STAKE_POOL_SEED,
  TOKEN_SEED,
  BSOL,
  BSOL_TO_SOL_FEED,
  BSOL_TO_SOL_DEVNET_FEED,
} from "config";
import { useNetworkConfiguration } from "contexts/NetworkConfigurationProvider";
import { createPool } from "program/instructions";
import { PROGRAM_ID } from "program/programId";
import { useCallback } from "react";
import { notify } from "../utils/notifications";

type CreateLotteryProps = {
  startTime: number;
  endTime: number;
};

export function CreateLottery(props: CreateLotteryProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { networkConfiguration } = useNetworkConfiguration();

  const onClick = useCallback(async () => {
    if (!publicKey) {
      notify({ type: "error", message: `Wallet not connected!` });
      console.log("error", `Send Transaction: Wallet not connected!`);
      return;
    }

    const startTime = new BN(Math.floor(Number(props.startTime) / 1000));
    const endTime = new BN(Math.floor(Number(props.endTime) / 1000));

    // const [poolConfig] = PublicKey.findProgramAddressSync(
    //   [Buffer.from(CONFIG_SEED)],
    //   PROGRAM_ID
    // );
    const [lotteryPool] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(STAKE_POOL_SEED),
        Buffer.from(startTime.toArray("le", 8)),
        Buffer.from(endTime.toArray("le", 8)),
        BSOL.toBuffer(),
      ],
      PROGRAM_ID
    );
    const [ticketMint] = PublicKey.findProgramAddressSync(
      [Buffer.from(TICKET_SEED), lotteryPool.toBuffer()],
      PROGRAM_ID
    );
    const [stakeToken] = PublicKey.findProgramAddressSync(
      [Buffer.from(TOKEN_SEED), lotteryPool.toBuffer()],
      PROGRAM_ID
    );
    const ticketMintMetadata = await Metadata.getPDA(ticketMint);
    const switchboardAggregator =
      networkConfiguration === "devnet"
        ? BSOL_TO_SOL_DEVNET_FEED
        : BSOL_TO_SOL_FEED;

    let signature: TransactionSignature = "";
    try {
      // Create instructions to send, in this case a simple transfer
      const instructions = [
        createPool(
          {
            startTime,
            endTime,
            tokenName: "bSOL",
          },
          {
            signer: publicKey,
            lotteryPool,
            stakeToken,
            ticketMint,
            ticketMintMetadata,
            mint: BSOL,
            switchboardAggregator,
            tokenMetadataProgram: MetadataProgram.PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          }
        ),
      ];

      // Get the lates block hash to use on our transaction and confirmation
      const latestBlockhash = await connection.getLatestBlockhash();

      // Create a new TransactionMessage with version and compile it to legacy
      const messageLegacy = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions,
      }).compileToLegacyMessage();

      // Create a new VersionedTransacction which supports legacy and v0
      const transation = new VersionedTransaction(messageLegacy);

      // Send transaction and await for signature
      signature = await sendTransaction(transation, connection, {
        skipPreflight: true,
      });

      // Send transaction and await for signature
      await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed"
      );

      console.log(signature);
      notify({
        type: "success",
        message: "Transaction successful!",
        txid: signature,
      });
    } catch (error: any) {
      if (error instanceof WalletError) {
        return;
      }
      notify({
        type: "error",
        message: `Transaction failed!`,
        description: error?.message,
        txid: signature,
      });
      console.warn("error", `Transaction failed! ${error?.message}`, signature);
    }
  }, [
    publicKey,
    props.startTime,
    props.endTime,
    networkConfiguration,
    connection,
    sendTransaction,
  ]);

  return (
    <div className="flex flex-row justify-center">
      <div className="relative group items-center">
        <div
          className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"
        ></div>
        <button
          className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
          onClick={onClick}
          disabled={!publicKey}
        >
          <div className="hidden group-disabled:block">
            Wallet not connected
          </div>
          <span className="block group-disabled:hidden">Create Lottery</span>
        </button>
      </div>
    </div>
  );
}
