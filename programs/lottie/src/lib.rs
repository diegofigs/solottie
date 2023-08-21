pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub mod utils;

use anchor_lang::prelude::*;

use instructions::*;

declare_id!("5rrtDkohLqXvzrxfVTkHK685HztRd8Gzbx6yeNbuDiMk");

#[program]
pub mod lottie {
    use super::*;

    pub fn create_pool(
        ctx: Context<CreatePool>,
        start_time: i64,
        end_time: i64,
        token_name: String,
    ) -> Result<()> {
        instructions::create_pool(ctx, start_time, end_time, token_name)
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        instructions::stake(ctx, amount)
    }

    pub fn start(ctx: Context<Start>) -> Result<()> {
        instructions::start(ctx)
    }

    pub fn settle(ctx: Context<Settle>) -> Result<()> {
        instructions::settle(ctx)
    }

    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        instructions::unstake(ctx)
    }

    pub fn close_pool(ctx: Context<ClosePool>) -> Result<()> {
        instructions::close_pool(ctx)
    }
}
