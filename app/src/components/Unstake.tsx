import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  TransactionMessage,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { TICKET_SEED, TOKEN_SEED } from "config";
import { PROGRAM_ID } from "program/programId";
import { useCallback } from "react";
import { notify } from "../utils/notifications";
import { unstake } from "program/instructions";

type StakeProps = {
  id: PublicKey;
  mint: PublicKey;
};
export function Unstake({ id, mint }: StakeProps) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet;

  const onClick = useCallback(async () => {
    if (!publicKey) {
      notify({ type: "error", message: `Wallet not connected!` });
      console.log("error", `Send Transaction: Wallet not connected!`);
      return;
    }

    const [ticketMint] = PublicKey.findProgramAddressSync(
      [Buffer.from(TICKET_SEED), id.toBuffer()],
      PROGRAM_ID
    );
    const [stakeToken] = PublicKey.findProgramAddressSync(
      [Buffer.from(TOKEN_SEED), id.toBuffer()],
      PROGRAM_ID
    );
    const userToken = getAssociatedTokenAddressSync(mint, publicKey);
    const userTicket = getAssociatedTokenAddressSync(ticketMint, publicKey);

    let signature: TransactionSignature = "";
    try {
      // Create instructions to send, in this case a simple transfer
      const instructions = [
        unstake({
          signer: publicKey,
          lotteryPool: id,
          ticketMint,
          stakeToken,
          userToken,
          userTicket,
          mint,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        }),
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
      signature = await sendTransaction(transation, connection);

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
      notify({
        type: "error",
        message: `Transaction failed!`,
        description: error?.message,
        txid: signature,
      });
      console.log("error", `Transaction failed! ${error?.message}`, signature);
      return;
    }
  }, [publicKey, id, mint, connection, sendTransaction]);

  return (
    <div className="flex-1 my-2 flex flex-row justify-center">
      <div className="w-[50%] relative group items-center">
        <div
          className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                    rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"
        ></div>

        <button
          className="px-8 w-full btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
          onClick={onClick}
        >
          <span>Unstake</span>
        </button>
      </div>
    </div>
  );
}
