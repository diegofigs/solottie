use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::LottieError;
use crate::state::*;

#[derive(Accounts)]
pub struct ClosePool<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        close = signer,
        seeds = [
            STAKE_POOL_SEED,
            &lottery_pool.start_time.to_le_bytes(),
            &lottery_pool.end_time.to_le_bytes(),
            &lottery_pool.mint.key().to_bytes(),
        ],
        bump,
    )]
    pub lottery_pool: Account<'info, LotteryPool>,
}

pub fn close_pool(ctx: Context<ClosePool>) -> Result<()> {
    if ctx.accounts.lottery_pool.holders.len() != 0 {
        return err!(LottieError::CannotCloseWithDeposits);
    }

    Ok(())
}
