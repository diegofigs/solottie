pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub mod utils;

use anchor_lang::prelude::*;

use instructions::*;

declare_id!("5rrtDkohLqXvzrxfVTkHK685HztRd8Gzbx6yeNbuDiMk");

/// Program for creating and participating in lotteries on Solana.
#[program]
pub mod lottie {
    use super::*;

    /// Creates lottery pool with provided wait period and label
    pub fn create_pool(
        ctx: Context<CreatePool>,
        start_time: i64,
        end_time: i64,
        token_name: String,
    ) -> Result<()> {
        instructions::create_pool(ctx, start_time, end_time, token_name)
    }

    /// Deposits token amount to lottery pool
    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        instructions::stake(ctx, amount)
    }

    /// Cranks pool for start of lottery pool
    pub fn start(ctx: Context<Start>) -> Result<()> {
        instructions::start(ctx)
    }

    /// Cranks pool for settlement of lottery pool
    pub fn settle(ctx: Context<Settle>) -> Result<()> {
        instructions::settle(ctx)
    }

    /// Withdraws collateral and prize from lottery pool
    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        instructions::unstake(ctx)
    }

    /// Closes lottery account for lamports
    pub fn close_pool(ctx: Context<ClosePool>) -> Result<()> {
        instructions::close_pool(ctx)
    }
}
