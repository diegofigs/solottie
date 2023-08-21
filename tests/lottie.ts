import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  Keypair,
  SystemProgram,
} from "@solana/web3.js";
import {
  Metadata,
  MetadataProgram,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  transfer,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { stakePoolInfo, depositSol } from "@solana/spl-stake-pool";
import { NodeOracle } from "@switchboard-xyz/oracle";
import { sleep } from "@switchboard-xyz/common";
import {
  AggregatorAccount,
  SwitchboardTestContext,
} from "@switchboard-xyz/solana.js";
import { Lottie } from "../target/types/lottie";

// const CONFIG_SEED = "config";
const STAKE_POOL_SEED = "stake_pool";
const TICKET_SEED = "ticket";
const TOKEN_SEED = "token";
const BLAZESTAKE_POOL = new PublicKey(
  "stk9ApL5HeVAwPLr3TLhDXdZS8ptVu7zp6ov8HFDuMi"
);
const BSOL = new PublicKey("bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1");
// seconds
const STAKE_PERIOD = 3;
const SETTLE_PERIOD = 5;
// conversion rates
// const START_RATE = 1.05;
// const END_RATE = 1.075;

describe("lottie", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;
  const guest = Keypair.generate();

  const program = anchor.workspace.Lottie as Program<Lottie>;
  // type LotteryPool = Awaited<ReturnType<typeof program['account']['lotteryPool']['all']>>[number];

  let switchboard: SwitchboardTestContext;
  let oracle: NodeOracle;
  let aggregatorAccount: AggregatorAccount;
  let conversionRate: number;
  let poolId: PublicKey;

  before(async () => {
    switchboard = await SwitchboardTestContext.loadFromProvider(provider, {
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
    oracle = await NodeOracle.fromReleaseChannel({
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
      silent: true,
      // optional env variables to speed up the workflow
      envVariables: {
        VERBOSE: "1",
        DEBUG: "1",
        DISABLE_NONCE_QUEUE: "1",
        DISABLE_METRICS: "1",
      },
    });

    // start the oracle and wait for it to start heartbeating on-chain
    await oracle.startAndAwait();
    conversionRate = await getStakePoolConversionRate(provider.connection);
    [aggregatorAccount] = await switchboard.createStaticFeed({
      batchSize: 1,
      minRequiredOracleResults: 1,
      minRequiredJobResults: 1,
      minUpdateDelaySeconds: 5,
      fundAmount: 0.15,
      enable: true,
      slidingWindow: true,
      value: conversionRate,
    });

    await mintPoolTokens(
      provider.connection,
      payer,
      Math.floor(100 * conversionRate * LAMPORTS_PER_SOL)
    );
    const userToken = getAssociatedTokenAddressSync(BSOL, payer.publicKey);
    const guestToken = getAssociatedTokenAddressSync(BSOL, guest.publicKey);
    const recentBlockhash = await provider.connection.getLatestBlockhash();
    let transaction = new Transaction({
      blockhash: recentBlockhash.blockhash,
      lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
      feePayer: payer.publicKey,
    });
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: guest.publicKey,
        lamports: 1 * LAMPORTS_PER_SOL,
      }),
      createAssociatedTokenAccountIdempotentInstruction(
        payer.publicKey,
        guestToken,
        guest.publicKey,
        BSOL
      )
    );
    await provider.sendAndConfirm(transaction);
    await transfer(
      provider.connection,
      payer.payer,
      userToken,
      guestToken,
      payer.publicKey,
      50 * LAMPORTS_PER_SOL
    );
  });

  after(() => {
    oracle?.stop();
  });

  it("can create pool", async () => {
    // const [poolConfig] = PublicKey.findProgramAddressSync(
    //   [Buffer.from(CONFIG_SEED)],
    //   program.programId
    // );

    const now = Math.floor(new Date().getTime() / 1_000);
    const startTime = new anchor.BN(now + STAKE_PERIOD);
    const endTime = new anchor.BN(now + STAKE_PERIOD + SETTLE_PERIOD);

    const [lotteryPool] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(STAKE_POOL_SEED),
        startTime.toBuffer("le", 8),
        endTime.toBuffer("le", 8),
        BSOL.toBuffer(),
      ],
      program.programId
    );
    poolId = lotteryPool;

    const { ticketMint, stakeToken } = getAccounts(
      payer.publicKey,
      lotteryPool
    );

    const ticketMintMetadata = await Metadata.getPDA(ticketMint);
    await program.methods
      .createPool(startTime, endTime, "bSOL")
      .accounts({
        signer: payer.publicKey,
        lotteryPool,
        stakeToken,
        ticketMint,
        ticketMintMetadata,
        mint: BSOL,
        switchboardAggregator: aggregatorAccount.publicKey,
        tokenMetadataProgram: MetadataProgram.PUBKEY,
      })
      .signers([payer.payer])
      .rpc();
  });

  it("can stake", async () => {
    const lotteryPool = await program.account.lotteryPool.fetch(poolId);

    const { ticketMint, stakeToken, userToken, userTicket } = getAccounts(
      payer.publicKey,
      poolId
    );

    await program.methods
      .stake(new anchor.BN(50 * LAMPORTS_PER_SOL))
      .accounts({
        signer: payer.publicKey,
        lotteryPool: poolId,
        stakeToken,
        userToken,
        userTicket,
        ticketMint,
        mint: lotteryPool.mint,
      })
      .signers([payer.payer])
      .rpc();

    const {
      stakeToken: guestStakeToken,
      userToken: guestToken,
      userTicket: guestTicket,
    } = getAccounts(guest.publicKey, poolId);

    await program.methods
      .stake(new anchor.BN(50 * LAMPORTS_PER_SOL))
      .accounts({
        signer: guest.publicKey,
        lotteryPool: poolId,
        stakeToken: guestStakeToken,
        userToken: guestToken,
        userTicket: guestTicket,
        ticketMint,
        mint: lotteryPool.mint,
      })
      .signers([guest])
      .rpc();
  });

  it("can start", async () => {
    await sleep(STAKE_PERIOD * 1000);

    const lotteryPool = await program.account.lotteryPool.fetch(poolId);

    await program.methods
      .start()
      .accounts({
        signer: payer.publicKey,
        lotteryPool: poolId,
        mint: lotteryPool.mint,
        switchboardAggregator: aggregatorAccount.publicKey,
      })
      .signers([payer.payer])
      .rpc();
  });

  it("can settle", async () => {
    await sleep(SETTLE_PERIOD * 1000);

    await switchboard.updateStaticFeed(
      aggregatorAccount,
      conversionRate + 0.02
    );

    const lotteryPool = await program.account.lotteryPool.fetch(poolId);

    await program.methods
      .settle()
      .accounts({
        signer: payer.publicKey,
        lotteryPool: poolId,
        mint: lotteryPool.mint,
        switchboardAggregator: aggregatorAccount.publicKey,
      })
      .signers([payer.payer])
      .rpc();
  });

  it("can unstake", async () => {
    const lotteryPool = await program.account.lotteryPool.fetch(poolId);

    const { ticketMint, stakeToken, userToken, userTicket } = getAccounts(
      payer.publicKey,
      poolId
    );

    await program.methods
      .unstake()
      .accounts({
        signer: payer.publicKey,
        lotteryPool: poolId,
        stakeToken,
        userToken,
        userTicket,
        ticketMint,
        mint: lotteryPool.mint,
      })
      .signers([payer.payer])
      .rpc({ skipPreflight: true });

    const {
      stakeToken: guestStakeToken,
      userToken: guestToken,
      userTicket: guestTicket,
    } = getAccounts(guest.publicKey, poolId);

    await program.methods
      .unstake()
      .accounts({
        signer: guest.publicKey,
        lotteryPool: poolId,
        stakeToken: guestStakeToken,
        userToken: guestToken,
        userTicket: guestTicket,
        ticketMint,
        mint: lotteryPool.mint,
      })
      .signers([guest])
      .rpc();
  });

  it("can view state", async () => {
    const lotteryPools = await program.account.lotteryPool.all();
    console.debug("Accounts: ", lotteryPools.length);
    const updatedPool = await program.account.lotteryPool.fetch(poolId);
    console.debug("LotteryPool Account");
    console.debug(updatedPool);
    console.debug(
      `Started At: ${new Date(updatedPool.startedAt.toNumber() * 1000)}`
    );
    console.debug(
      `Settled At: ${new Date(updatedPool.settledAt.toNumber() * 1000)}`
    );
    console.debug(
      `Start Rate: ${updatedPool.startRate.toNumber() / LAMPORTS_PER_SOL}`
    );
    console.debug(
      `End Rate: ${updatedPool.endRate.toNumber() / LAMPORTS_PER_SOL}`
    );
    console.debug(`Winner: ${updatedPool.winner.toString()}`);
    const { userToken, stakeToken } = getAccounts(payer.publicKey, poolId);
    const { userToken: guestToken } = getAccounts(guest.publicKey, poolId);
    const poolBalance = await provider.connection.getTokenAccountBalance(
      stakeToken
    );
    const balance = await provider.connection.getTokenAccountBalance(userToken);
    const guestBalance = await provider.connection.getTokenAccountBalance(
      guestToken
    );
    console.debug(`Pool Balance: ${poolBalance.value.uiAmountString}`);
    console.debug(`User Balance: ${balance.value.uiAmountString}`);
    console.debug(`Guest Balance: ${guestBalance.value.uiAmountString}`);
  });

  it("can close pool", async () => {
    const now = Math.floor(new Date().getTime() / 1_000);
    const startTime = new anchor.BN(now + STAKE_PERIOD);
    const endTime = new anchor.BN(now + STAKE_PERIOD + SETTLE_PERIOD);

    const [lotteryPool] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(STAKE_POOL_SEED),
        startTime.toBuffer("le", 8),
        endTime.toBuffer("le", 8),
        BSOL.toBuffer(),
      ],
      program.programId
    );

    const { ticketMint, stakeToken } = getAccounts(
      payer.publicKey,
      lotteryPool
    );

    const ticketMintMetadata = await Metadata.getPDA(ticketMint);
    await program.methods
      .createPool(startTime, endTime, "bSOL")
      .accounts({
        signer: payer.publicKey,
        lotteryPool,
        stakeToken,
        ticketMint,
        ticketMintMetadata,
        mint: BSOL,
        switchboardAggregator: aggregatorAccount.publicKey,
        tokenMetadataProgram: MetadataProgram.PUBKEY,
      })
      .signers([payer.payer])
      .rpc();

    await program.methods
      .closePool()
      .accounts({
        signer: payer.publicKey,
        lotteryPool,
      })
      .signers([payer.payer])
      .rpc();

    try {
      const deletedPool = await program.account.lotteryPool.fetch(lotteryPool);
      console.debug(deletedPool);
    } catch (err) {}
  });

  async function mintPoolTokens(
    connection: Connection,
    wallet: anchor.Wallet,
    lamports: number
  ) {
    try {
      // let info = await stakePoolInfo(connection, BLAZESTAKE_POOL);
      // if (info.details.updateRequired) {
      //   await updatePool();
      // }

      const ata = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer.payer,
        BSOL,
        payer.publicKey
      );

      let depositTx = await depositSol(
        connection,
        BLAZESTAKE_POOL,
        wallet.publicKey,
        lamports,
        ata.address,
        ata.address
      );

      const recentBlockhash = await connection.getLatestBlockhash();
      let transaction = new Transaction({
        blockhash: recentBlockhash.blockhash,
        lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
        feePayer: wallet.publicKey,
      });
      transaction.add(...depositTx.instructions);

      // INSERT YOUR CODE HERE TO SIGN A TRANSACTION WITH A WALLET
      transaction = await wallet.signTransaction(transaction);

      let signers = depositTx.signers;
      if (signers.length > 0) {
        transaction.partialSign(...signers);
      }

      // let txid = await sendAndConfirmRawTransaction(
      //   connection,
      //   transaction.serialize(),
      // );
      const txid = await provider.sendAndConfirm(transaction);
      return txid;
    } catch (err) {
      console.warn(err);
    }
  }

  function getAccounts(publicKey: PublicKey, lotteryPool: PublicKey) {
    const [ticketMint] = PublicKey.findProgramAddressSync(
      [Buffer.from(TICKET_SEED), lotteryPool.toBuffer()],
      program.programId
    );
    const [stakeToken] = PublicKey.findProgramAddressSync(
      [Buffer.from(TOKEN_SEED), lotteryPool.toBuffer()],
      program.programId
    );

    const userToken = getAssociatedTokenAddressSync(BSOL, publicKey);
    const userTicket = getAssociatedTokenAddressSync(ticketMint, publicKey);

    return { ticketMint, stakeToken, userToken, userTicket };
  }

  async function getStakePoolConversionRate(connection: Connection) {
    const info = await stakePoolInfo(connection, BLAZESTAKE_POOL);

    let solanaAmount = info.details.reserveStakeLamports;
    for (let i = 0; i < info.details.stakeAccounts.length; i++) {
      solanaAmount += parseInt(info.details.stakeAccounts[i].validatorLamports);
    }
    let tokenAmount = parseInt(info.poolTokenSupply);
    let conversion = solanaAmount / tokenAmount;
    return conversion;
  }
});
