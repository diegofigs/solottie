use std::ops::Mul;

use anchor_lang::{prelude::*, system_program};
use anchor_spl::token::Mint;
use switchboard_solana::rust_decimal::prelude::ToPrimitive;

#[account]
pub struct LotteryPool {
    pub mint: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub started_at: Option<i64>,
    pub settled_at: Option<i64>,
    pub start_rate: Option<u64>,
    pub end_rate: Option<u64>,
    pub holders: Vec<Pubkey>,
    pub amounts: Vec<u64>,
    pub supply: u64,
    pub winner: Option<Pubkey>,
    pub bump: u8,
    pub switchboard_aggregator: Pubkey,
}

pub trait LotteryPoolAccount<'info> {
    fn buy_tickets(
        &mut self,
        address: Pubkey,
        amount: u64,
        payer: &Signer<'info>,
        system_program: &Program<'info, System>,
    ) -> Result<()>;
    fn start(&mut self, val: f64, timestamp: i64, mint: &Mint) -> Result<()>;
    fn settle(&mut self, val: f64, timestamp: i64, mint: &Mint) -> Result<()>;
    fn realloc(
        &mut self,
        space_to_add: usize,
        payer: &Signer<'info>,
        system_program: &Program<'info, System>,
    ) -> Result<()>;
}

impl<'info> LotteryPoolAccount<'info> for Account<'info, LotteryPool> {
    fn buy_tickets(
        &mut self,
        address: Pubkey,
        amount: u64,
        payer: &Signer<'info>,
        system_program: &Program<'info, System>,
    ) -> Result<()> {
        let index = self.holders.iter().position(|&x| x == address);
        if index.is_some() {
            self.amounts[index.unwrap()] += amount;
        } else {
            self.realloc(40, payer, system_program)?;
            self.holders.push(address);
            self.amounts.push(amount);
        }
        self.supply += amount;
        Ok(())
    }

    fn start(&mut self, val: f64, timestamp: i64, mint: &Mint) -> Result<()> {
        self.started_at = Some(timestamp);
        self.start_rate = Some(
            val.mul((10u64.pow(mint.decimals.into())).to_f64().unwrap())
                .to_u64()
                .unwrap(),
        );
        Ok(())
    }

    fn settle(&mut self, val: f64, timestamp: i64, mint: &Mint) -> Result<()> {
        self.settled_at = Some(timestamp);
        self.end_rate = Some(
            val.mul((10u64.pow(mint.decimals.into())).to_f64().unwrap())
                .to_u64()
                .unwrap(),
        );
        Ok(())
    }

    fn realloc(
        &mut self,
        space_to_add: usize,
        payer: &Signer<'info>,
        system_program: &Program<'info, System>,
    ) -> Result<()> {
        let account_info = self.to_account_info();
        let new_account_size = account_info.data_len() + space_to_add;

        // Determine additional rent required
        let lamports_required = (Rent::get()?).minimum_balance(new_account_size);
        let additional_rent_to_fund = lamports_required - account_info.lamports();

        // Perform transfer of additional rent
        system_program::transfer(
            CpiContext::new(
                system_program.to_account_info(),
                system_program::Transfer {
                    from: payer.to_account_info(),
                    to: account_info.clone(),
                },
            ),
            additional_rent_to_fund,
        )?;

        // Reallocate the account
        account_info.realloc(new_account_size, false)?;
        Ok(())
    }
}
