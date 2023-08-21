//! Solchemist program errors
use anchor_lang::prelude::*;

#[error_code]
pub enum LottieError {
    #[msg("An invalid asset mint address was provided")]
    InvalidAssetKey,

    #[msg("The timestamp is not at a future point in time")]
    InvalidTimestamp,

    #[msg("The amount proposed to stake is not great enough for at least 1 ticket")]
    AmountNotEnough,

    #[msg("The lottery pool stake period has ended")]
    PastStakePeriod,

    #[msg("The lottery pool unstake period has not started")]
    BeforeUnstakePeriod,

    #[msg("The lottery pool start period has not started")]
    BeforeStartPeriod,

    #[msg("The lottery pool start period has ended")]
    PastStartPeriod,

    #[msg("The lottery pool settle period has not started")]
    BeforeSettlePeriod,

    #[msg("The lottery pool has already been started")]
    AlreadyStarted,

    #[msg("The lottery pool has already been settled")]
    AlreadySettled,

    #[msg("The lottery pool tickets have already been redeemed")]
    AlreadyRedeemed,

    #[msg("The lottery pool cannot be closed because it has deposits")]
    CannotCloseWithDeposits,
}

#[error_code]
#[derive(Eq, PartialEq)]
pub enum FeedErrorCode {
    #[msg("Switchboard feed has not been updated in 5 minutes")]
    StaleFeed,
}
