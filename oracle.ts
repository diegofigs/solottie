import * as anchor from "@coral-xyz/anchor";
import { stakePoolInfo } from "@solana/spl-stake-pool";
import { Connection } from "@solana/web3.js";
import { NodeOracle, sleep } from "@switchboard-xyz/oracle";
import { SwitchboardTestContext } from "@switchboard-xyz/solana.js";
import { BLAZESTAKE_POOL } from "./app/src/config";

async function main() {
  const connection = new Connection("http://localhost:8899");
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const switchboard = await SwitchboardTestContext.loadFromProvider(provider, {
    name: "Test Queue",
    // You can provide a keypair to so the PDA schemes dont change between test runs
    keypair: SwitchboardTestContext.loadKeypair("~/.keypairs/queue.json"),
    queueSize: 10,
    reward: 0,
    minStake: 0,
    oracleTimeout: 900,
    // aggregators will not require PERMIT_ORACLE_QUEUE_USAGE before joining a queue
    unpermissionedFeeds: true,
    unpermissionedVrf: true,
    enableBufferRelayers: true,
    oracle: {
      name: "Test Oracle",
      enable: true,
      stakingWalletKeypair: SwitchboardTestContext.loadKeypair(
        "~/.keypairs/oracleWallet.json"
      ),
    },
  });
  const oracle = await NodeOracle.fromReleaseChannel({
    chain: "solana",
    // use the latest testnet (devnet) version of the oracle
    releaseChannel: "mainnet",
    // disables production capabilities like monitoring and alerts
    network: "localnet",
    rpcUrl: provider.connection.rpcEndpoint,
    oracleKey: switchboard.oracle.publicKey.toBase58(),
    // path to the payer keypair so the oracle can pay for txns
    secretPath: switchboard.walletPath || "~/.config/solana/id.json",
    // set to true to suppress oracle logs in the console
    silent: false,
    // optional env variables to speed up the workflow
    envVariables: {
      VERBOSE: "1",
      DEBUG: "1",
      DISABLE_NONCE_QUEUE: "1",
      DISABLE_METRICS: "1",
    },
  });

  try {
    await oracle.startAndAwait();
    console.log("oracle ready");
    const conversionRate = await getStakePoolConversionRate(connection);

    const [aggregatorAccount] = await switchboard.createStaticFeed({
      batchSize: 1,
      minRequiredOracleResults: 1,
      minRequiredJobResults: 1,
      minUpdateDelaySeconds: 5,
      fundAmount: 0.15,
      enable: true,
      slidingWindow: true,
      value: conversionRate,
    });
    while (true) {
      await switchboard.updateStaticFeed(
        aggregatorAccount,
        conversionRate + 0.02
      );
      const value = await aggregatorAccount.fetchLatestValue();
      console.log(value);
      await sleep(10000);
    }
  } catch (error) {
    console.error(error);
  }

  // oracle.stop();
}

main();

async function getStakePoolConversionRate(connection: Connection) {
  let info = await stakePoolInfo(connection, BLAZESTAKE_POOL);

  let solanaAmount = info.details.reserveStakeLamports;
  for (let i = 0; i < info.details.stakeAccounts.length; i++) {
    solanaAmount += parseInt(info.details.stakeAccounts[i].validatorLamports);
  }
  let tokenAmount = parseInt(info.poolTokenSupply);
  let conversion = solanaAmount / tokenAmount;
  return conversion;
}
