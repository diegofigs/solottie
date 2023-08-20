use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use switchboard_solana::AggregatorAccountData;

use crate::constants::*;
use crate::error::*;
use crate::state::*;

#[derive(Accounts)]
pub struct Start<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    /// Lottery Pool account stores pool metadata.
    #[account(
        mut,
        seeds = [
            STAKE_POOL_SEED,
            &lottery_pool.start_time.to_le_bytes(),
            &lottery_pool.end_time.to_le_bytes(),
            &lottery_pool.mint.key().to_bytes(),
        ],
        bump,
        has_one = switchboard_aggregator
    )]
    pub lottery_pool: Box<Account<'info, LotteryPool>>,

    /// Mint account is the stakeable token.
    #[account(address = lottery_pool.mint)]
    pub mint: Account<'info, Mint>,
    pub switchboard_aggregator: AccountLoader<'info, AggregatorAccountData>,
}

pub fn start(ctx: Context<Start>) -> Result<()> {
    let clock = Clock::get()?;
    let lottery_pool = &mut ctx.accounts.lottery_pool;

    if lottery_pool.started_at.is_some() {
        return err!(LottieError::AlreadyStarted);
    }
    let ts = clock.unix_timestamp;
    if ts < lottery_pool.start_time {
        return err!(LottieError::BeforeStartPeriod);
    }
    if ts >= lottery_pool.end_time {
        return err!(LottieError::PastStartPeriod);
    }

    let feed = &ctx.accounts.switchboard_aggregator.load()?;

    // get result
    let val: f64 = feed.get_result()?.try_into()?;

    // check whether the feed has been updated in the last 300 seconds
    feed.check_staleness(ts, 300)
        .map_err(|_| error!(FeedErrorCode::StaleFeed))?;

    msg!("Start Rate: {}", val);

    lottery_pool.start(val, ts, &ctx.accounts.mint)?;

    Ok(())
}
