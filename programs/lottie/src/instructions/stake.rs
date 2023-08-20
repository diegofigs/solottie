use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, transfer, Mint, MintTo, Token, TokenAccount, Transfer},
};

use crate::constants::*;
use crate::error::LottieError;
use crate::state::*;

#[derive(Accounts)]
pub struct Stake<'info> {
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
    )]
    pub lottery_pool: Box<Account<'info, LotteryPool>>,

    /// Stake Token account holds token deposits.
    #[account(
        mut,
        seeds = [
            TOKEN_SEED,
            &lottery_pool.key().to_bytes(),
        ],
        bump,
    )]
    pub stake_token: Account<'info, TokenAccount>,

    /// User Token account is used to transfer tokens from.
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = signer,
    )]
    pub user_token: Account<'info, TokenAccount>,

    /// User Ticket account is used to transfer tickets to.
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = ticket_mint,
        associated_token::authority = signer,
    )]
    pub user_ticket: Account<'info, TokenAccount>,

    /// Ticket Mint account represents stake receipts.
    #[account(
        mut,
        seeds = [
            TICKET_SEED,
            &lottery_pool.key().to_bytes(),
        ],
        bump,
    )]
    pub ticket_mint: Account<'info, Mint>,

    /// Mint account is the stakeable token.
    #[account(address = lottery_pool.mint)]
    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
    let clock = Clock::get()?;
    if clock.unix_timestamp > ctx.accounts.lottery_pool.start_time {
        return err!(LottieError::PastStakePeriod);
    }

    if amount < 10u64.pow(ctx.accounts.mint.decimals.into()) {
        return err!(LottieError::AmountNotEnough);
    }

    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token.to_account_info(),
                to: ctx.accounts.stake_token.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
            },
        ),
        amount,
    )?;

    let bump = *ctx.bumps.get("ticket_mint").unwrap();
    let ticket_mint_seeds: &[&[&[u8]]] = &[&[
        TICKET_SEED,
        &ctx.accounts.lottery_pool.key().to_bytes(),
        &[bump],
    ]];
    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.ticket_mint.to_account_info(),
                to: ctx.accounts.user_ticket.to_account_info(),
                authority: ctx.accounts.ticket_mint.to_account_info(),
            },
            ticket_mint_seeds,
        ),
        amount,
    )?;

    ctx.accounts.lottery_pool.buy_tickets(
        ctx.accounts.signer.key(),
        amount,
        &ctx.accounts.signer,
        &ctx.accounts.system_program,
    )?;

    Ok(())
}
