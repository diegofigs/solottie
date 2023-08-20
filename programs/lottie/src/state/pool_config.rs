use anchor_lang::{prelude::*, system_program};

use crate::error::LottieError;

#[account]
pub struct PoolConfig {
    pub assets: Vec<Pubkey>,
    pub bump: u8,
}

impl PoolConfig {
    pub fn new(bump: u8) -> Self {
        Self {
            assets: vec![],
            bump,
        }
    }
}

pub trait PoolConfigAccount<'info> {
    fn check_asset_key(&self, key: &Pubkey) -> Result<()>;
    fn add_asset(
        &mut self,
        key: Pubkey,
        payer: &Signer<'info>,
        system_program: &Program<'info, System>,
    ) -> Result<()>;
    fn realloc(
        &mut self,
        space_to_add: usize,
        payer: &Signer<'info>,
        system_program: &Program<'info, System>,
    ) -> Result<()>;
}

impl<'info> PoolConfigAccount<'info> for Account<'info, PoolConfig> {
    /// Validates an asset's key is present in the Stake Pool's list of mint
    /// addresses, and throws an error if it is not
    fn check_asset_key(&self, key: &Pubkey) -> Result<()> {
        if self.assets.contains(key) {
            Ok(())
        } else {
            Err(LottieError::InvalidAssetKey.into())
        }
    }

    /// Adds an asset to the Lotterh Pool's list of mint addresses if it does
    /// not already exist in the list
    ///
    /// if the mint address is added, this will require reallocation of the
    /// account's size since the vector will be increasing by one `Pubkey`,
    /// which has a size of 32 bytes
    fn add_asset(
        &mut self,
        key: Pubkey,
        payer: &Signer<'info>,
        system_program: &Program<'info, System>,
    ) -> Result<()> {
        match self.check_asset_key(&key) {
            Ok(()) => (),
            Err(_) => {
                self.realloc(32, payer, system_program)?;
                self.assets.push(key)
            }
        };
        Ok(())
    }

    /// Reallocates the account's size to accommodate for changes in the data
    /// size. This is used in this program to reallocate the Liquidity Pool's
    /// account when it's vector of mint addresses (`Vec<Pubkey>`) is increased
    /// in size by pushing one `Pubkey` into the vector
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
