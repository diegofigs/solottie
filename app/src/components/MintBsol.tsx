import {
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { WalletError } from "@solana/wallet-adapter-base";
import {
  useConnection,
  useWallet,
  WalletContextState,
} from "@solana/wallet-adapter-react";
import {
  Connection,
  LAMPORTS_PER_SOL,
  sendAndConfirmRawTransaction,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";
import { BSOL, BLAZESTAKE_POOL } from "config";
import { FC, useCallback } from "react";
import { notify } from "../utils/notifications";
import { depositSol, stakePoolInfo } from "@solana/spl-stake-pool";

export const MintBsol: FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;

  const onClick = useCallback(async () => {
    if (!publicKey) {
      notify({ type: "error", message: `Wallet not connected!` });
      console.log("error", `Send Transaction: Wallet not connected!`);
      return;
    }

    const conversionRate = await getStakePoolConversionRate(connection);

    let signature: TransactionSignature = "";
    try {
      // Send transaction and await for signature
      signature = await mintPoolTokens(
        connection,
        wallet,
        Math.floor(1 * conversionRate * LAMPORTS_PER_SOL)
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
  }, [publicKey, connection, wallet]);

  return (
    <div className="flex flex-row justify-center">
      <div className="relative group items-center">
        <button
          className="group btn w-full md:w-60 bg-secondary hover:bg-secondary-dark
          text-dark dark:text-white"
          onClick={onClick}
          disabled={!publicKey}
        >
          <div className="hidden group-disabled:block">
            Wallet not connected
          </div>
          <span className="block group-disabled:hidden">Mint bSOL</span>
        </button>
      </div>
    </div>
  );
};

async function getStakePoolInfo(connection: Connection) {
  try {
    const info = await stakePoolInfo(connection, BLAZESTAKE_POOL);

    // let solanaAmount = info.details.reserveStakeLamports;
    // for (let i = 0; i < info.details.stakeAccounts.length; i++) {
    //   solanaAmount += parseInt(info.details.stakeAccounts[i].validatorLamports);
    // }
    // let tokenAmount = parseInt(info.poolTokenSupply);
    // let conversion = solanaAmount / tokenAmount;
    // console.debug(`Conversion: 1 bSOL = ${conversion} SOL`);

    // let validators = await(
    //   await fetch("https://stake.solblaze.org/api/v1/validator_count")
    // ).json().count;
    // console.log(`Number of validators: ${validators}`);

    // console.debug(`Total staked SOL (TVL): ${solanaAmount / LAMPORTS_PER_SOL}`);
    // console.debug(`Total bSOL (Supply): ${tokenAmount / LAMPORTS_PER_SOL}`);
    return info;
  } catch (err) {
    console.warn(err);
  }
}

async function getStakePoolConversionRate(connection: Connection) {
  const info = await getStakePoolInfo(connection);

  let solanaAmount = info.details.reserveStakeLamports;
  for (let i = 0; i < info.details.stakeAccounts.length; i++) {
    solanaAmount += parseInt(info.details.stakeAccounts[i].validatorLamports);
  }
  const tokenAmount = parseInt(info.poolTokenSupply);
  const conversion = solanaAmount / tokenAmount;
  return conversion;
}

async function mintPoolTokens(
  connection: Connection,
  wallet: WalletContextState,
  lamports: number
) {
  // let info = await stakePoolInfo(connection, BLAZESTAKE_POOL);
  // if (info.details.updateRequired) {
  //   await updatePool();
  // }

  const ata = getAssociatedTokenAddressSync(BSOL, wallet.publicKey);
  const ataIx = createAssociatedTokenAccountIdempotentInstruction(
    wallet.publicKey,
    ata,
    wallet.publicKey,
    BSOL
  );

  const depositTx = await depositSol(
    connection,
    BLAZESTAKE_POOL,
    wallet.publicKey,
    lamports,
    ata,
    ata
  );

  const latestBlockhash = await connection.getLatestBlockhash();
  let transaction = new Transaction({
    ...latestBlockhash,
    feePayer: wallet.publicKey,
  });
  transaction.add(ataIx, ...depositTx.instructions);

  // INSERT YOUR CODE HERE TO SIGN A TRANSACTION WITH A WALLET
  transaction = await wallet.signTransaction(transaction);

  const signers = depositTx.signers;
  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }

  const txid = await sendAndConfirmRawTransaction(
    connection,
    transaction.serialize()
  );
  return txid;
}
