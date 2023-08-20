use std::ops::{Div, Mul};

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{burn, transfer, Burn, Mint, Token, TokenAccount, Transfer},
};
use switchboard_solana::rust_decimal::prelude::ToPrimitive;

use crate::constants::*;
use crate::error::LottieError;
use crate::state::*;

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

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

    #[account(
        mut,
        seeds = [
            TOKEN_SEED,
            &lottery_pool.key().to_bytes(),
        ],
        bump,
    )]
    pub stake_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = lottery_pool.mint,
        associated_token::authority = signer,
    )]
    pub user_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = ticket_mint,
        associated_token::authority = signer,
    )]
    pub user_ticket: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            TICKET_SEED,
            &lottery_pool.key().to_bytes(),
        ],
        bump,
    )]
    pub ticket_mint: Account<'info, Mint>,

    #[account(address = lottery_pool.mint)]
    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
    if ctx.accounts.lottery_pool.settled_at.is_none() {
        return err!(LottieError::BeforeUnstakePeriod);
    }

    if ctx.accounts.user_ticket.amount == 0 {
        return err!(LottieError::AlreadyRedeemed);
    }
    burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.ticket_mint.to_account_info(),
                from: ctx.accounts.user_ticket.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
            },
        ),
        ctx.accounts.user_ticket.amount,
    )?;

    let lottery_pool = &ctx.accounts.lottery_pool;
    let mint = &ctx.accounts.mint;
    let mint_atoms = 10u64.pow(mint.decimals.into());

    let yield_factor = lottery_pool.end_rate.unwrap() - lottery_pool.start_rate.unwrap();
    msg!("Yield Factor: {}", yield_factor);

    let delta_factor = yield_factor
        .to_f64()
        .unwrap()
        .div(lottery_pool.end_rate.unwrap().to_f64().unwrap())
        .mul(mint_atoms.to_f64().unwrap())
        .to_u64()
        .unwrap();
    msg!("Delta Factor: {}", delta_factor);

    let collateral_factor = (10u64.pow(mint.decimals.into()))
        .checked_sub(delta_factor)
        .unwrap();
    msg!("Collateral Factor: {}", collateral_factor);

    let mut withdraw_amount = 0;
    if lottery_pool.winner.is_some() && lottery_pool.winner.unwrap().eq(&ctx.accounts.signer.key())
    {
        let total_yield = delta_factor
            .to_f64()
            .unwrap()
            .div(mint_atoms.to_f64().unwrap())
            .mul(
                lottery_pool
                    .supply
                    .to_f64()
                    .unwrap()
                    .div(mint_atoms.to_f64().unwrap()),
            )
            .mul(mint_atoms.to_f64().unwrap())
            .to_u64()
            .unwrap();
        withdraw_amount += total_yield;
        msg!("Yield: {}", total_yield);
    }

    let deposit_amount = ctx.accounts.user_ticket.amount;
    let collateral = collateral_factor
        .to_f64()
        .unwrap()
        .div(mint_atoms.to_f64().unwrap())
        .mul(
            deposit_amount
                .to_f64()
                .unwrap()
                .div(mint_atoms.to_f64().unwrap()),
        )
        .mul(mint_atoms.to_f64().unwrap())
        .to_u64()
        .unwrap();
    withdraw_amount += collateral;
    msg!("Collateral: {}", collateral);

    msg!("Deposit Amount: {}", deposit_amount);
    msg!("Withdraw Amount: {}", withdraw_amount);

    let bump = *ctx.bumps.get("stake_token").unwrap();
    let stake_token_seeds: &[&[&[u8]]] = &[&[TOKEN_SEED, &lottery_pool.key().to_bytes(), &[bump]]];
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.stake_token.to_account_info(),
                to: ctx.accounts.user_token.to_account_info(),
                authority: ctx.accounts.stake_token.to_account_info(),
            },
            stake_token_seeds,
        ),
        withdraw_amount,
    )?;

    Ok(())
}
