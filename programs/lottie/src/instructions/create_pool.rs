use std::str::FromStr;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_spl::token::{Mint, Token, TokenAccount};
use switchboard_solana::SWITCHBOARD_PROGRAM_ID;

use crate::constants::*;
use crate::error::LottieError;
use crate::state::*;

#[derive(Accounts)]
#[instruction(start_time: i64, end_time: i64)]
pub struct CreatePool<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    // #[account(
    //     init_if_needed,
    //     space = 8 + std::mem::size_of::<PoolConfig>(),
    //     payer = signer,
    //     seeds = [CONFIG_SEED],
    //     bump,
    // )]
    // pub pool_config: Account<'info, PoolConfig>,

    #[account(
        init,
        space = 8 + std::mem::size_of::<LotteryPool>(),
        payer = signer,
        seeds = [
            STAKE_POOL_SEED,
            &start_time.to_le_bytes(),
            &end_time.to_le_bytes(),
            &mint.key().to_bytes(),
        ],
        bump,
    )]
    pub lottery_pool: Box<Account<'info, LotteryPool>>,

    /// Stake Token account holds token deposits.
    #[account(
        init,
        payer = signer,
        seeds = [
            TOKEN_SEED,
            &lottery_pool.key().to_bytes()
        ],
        bump,
        token::mint = mint,
        token::authority = stake_token,
    )]
    pub stake_token: Account<'info, TokenAccount>,

    /// Ticket Mint account represents stake receipts.
    #[account(
        init,
        payer = signer,
        seeds = [
            TICKET_SEED,
            &lottery_pool.key().to_bytes(),
        ],
        bump,
        mint::decimals = mint.decimals,
        mint::authority = ticket_mint
    )]
    pub ticket_mint: Account<'info, Mint>,

    /// CHECK: metadata account for metaplex. Checked by CPI.
    #[account(mut)]
    pub ticket_mint_metadata: AccountInfo<'info>,

    /// Mint account is the stakeable token.
    #[account(address = Pubkey::from_str(BSOL_MINT).unwrap())]
    pub mint: Account<'info, Mint>,

    /// CHECK: oracle to fetch conversion rates
    #[account(owner = SWITCHBOARD_PROGRAM_ID)]
    pub switchboard_aggregator: AccountInfo<'info>,

    /// CHECK: metaplex program. Checked by CPI.
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// @notice Initializes a lottery pool with the provided parameters, including start and end times, mint, and aggregator details.
pub fn create_pool(
    ctx: Context<CreatePool>,
    start_time: i64,
    end_time: i64,
    token_name: String,
) -> Result<()> {
    let clock = Clock::get()?;
    if start_time <= clock.unix_timestamp || end_time <= start_time {
        return err!(LottieError::InvalidTimestamp);
    }

    // if ctx.accounts.pool_config.assets.len() == 0 {
    //     ctx.accounts.pool_config.set_inner(PoolConfig::new(
    //         *ctx.bumps
    //             .get("pool_config")
    //             .expect("Failed to fetch bump for `config`"),
    //     ));
    //     // todo: add native asset strategy
    //     // ctx.accounts.pool_config.add_asset(
    //     //     native_mint::id(),
    //     //     &ctx.accounts.signer,
    //     //     &ctx.accounts.system_program,
    //     // )?;
    //     ctx.accounts.pool_config.add_asset(
    //         Pubkey::from_str(BSOL_MINT).unwrap(),
    //         &ctx.accounts.signer,
    //         &ctx.accounts.system_program,
    //     )?;
    // }
    //
    // if !ctx
    //     .accounts
    //     .pool_config
    //     .assets
    //     .contains(&ctx.accounts.mint.key())
    // {
    //     return err!(LottieError::InvalidAssetKey);
    // }

    let lottery_pool = &mut ctx.accounts.lottery_pool;
    lottery_pool.mint = ctx.accounts.mint.key();
    lottery_pool.start_time = start_time;
    lottery_pool.end_time = end_time;
    lottery_pool.bump = *ctx.bumps.get("lottery_pool").unwrap();
    lottery_pool.switchboard_aggregator = ctx.accounts.switchboard_aggregator.key();

    let metadata_ix = mpl_token_metadata::instruction::create_metadata_accounts_v3(
        mpl_token_metadata::ID,
        ctx.accounts.ticket_mint_metadata.key(),
        ctx.accounts.ticket_mint.key(),
        ctx.accounts.ticket_mint.key(),
        ctx.accounts.signer.key(),
        ctx.accounts.ticket_mint.key(),
        "Lottie Ticket ".to_string() + &token_name,
        "LT".to_string(),
        "https://www.solottie.xyz/assets/ticket/metadata.json".to_string(),
        None,
        0,
        true,
        true,
        None,
        None,
        None,
    );

    invoke_signed(
        &metadata_ix,
        &[
            ctx.accounts.ticket_mint_metadata.to_account_info(),
            ctx.accounts.ticket_mint.to_account_info(),
            ctx.accounts.signer.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        &[&[
            TICKET_SEED,
            &ctx.accounts.lottery_pool.key().to_bytes(),
            &[*ctx.bumps.get("ticket_mint").unwrap()],
        ]],
    )?;

    Ok(())
}
