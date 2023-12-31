import * as anchor from "@coral-xyz/anchor";
import { OracleJob } from "@switchboard-xyz/common";
import { NodeOracle, sleep } from "@switchboard-xyz/oracle";
import {
  AggregatorAccount,
  SwitchboardTestContext,
} from "@switchboard-xyz/solana.js";
import { BLAZESTAKE_POOL } from "./app/src/config";

const createPoolJob = (pool: string) => `
tasks:
  - splStakePoolTask:
      pubkey: ${pool}
  - cacheTask:
      cacheItems:
        - variableName: poolTokenSupply
          job:
            tasks:
              - jsonParseTask:
                  path: $.uiPoolTokenSupply
        - variableName: totalStakeLamports
          job:
            tasks:
              - jsonParseTask:
                  path: $.uiTotalLamports
  - valueTask:
      big: \${totalStakeLamports}
  - divideTask:
      big: \${poolTokenSupply}
`;

async function main() {
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

    const [bSolFeed] = await switchboard.queue.createFeed({
      batchSize: 1,
      minRequiredOracleResults: 1,
      minRequiredJobResults: 1,
      minUpdateDelaySeconds: 5,
      fundAmount: 0.15,
      enable: true,
      slidingWindow: true,
      jobs: [
        {
          data: OracleJob.encodeDelimited(
            OracleJob.fromYaml(createPoolJob(BLAZESTAKE_POOL.toString()))
          ).finish(),
        },
      ],
    });
    console.info(`bSOL/SOL Feed: ${bSolFeed.publicKey}`);

    while (true) {
      try {
        const [bSolState] = await bSolFeed.openRoundAndAwaitResult();
        const bSolValue = AggregatorAccount.decodeLatestValue(bSolState);
        console.info(`Latest Value: ${bSolValue.toNumber()}`);
      } catch (err) {
        console.warn(err);
      }
      await sleep(10000);
    }
  } catch (error) {
    console.error(error);
  }

  // oracle.stop();
}

main();
