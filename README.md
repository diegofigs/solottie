# Solottie

A lottery protocol that redistributes SOL staking yield as prizes. Protocol is permissionless for lottery pool creation but closed loop in that it only accepts bSOL for demonstration purposes. Program is live on Devnet.

## Addresses

- Program (Devnet): 5rrtDkohLqXvzrxfVTkHK685HztRd8Gzbx6yeNbuDiMk

- bSOL/SOL Price Feed (Devnet): 6SKYzyMTHUpoma6Qt6KfRu1aBYGBGiWRYp4XRSEzixgA

- bSOL/SOL Price Feed (Mainnet): 2yWjZ439MMEtAZZxk4RC2C9GB71fHaWHYm82943CvNBy

## Methodology

Program sources the conversion rate of bSOL/SOL from a Switchboard Price Feed on start and settlement, treating the difference as yield for the winner and returning equal deposit value to all losers.

## Testing

Main integration test goes thru a full round of lottery by mocking a price feed oracle, creating a lottery with 2 participants on equal stake. Tests can be run with `anchor test`.

## Future Work

- Add support for other LSTs like mSOL, jitoSOL, etc.

- Add support for other prize strategies like weighted distribution and winner takes all deposits.

- Implement auto-cranker for start/settle instructions

- Implement better source of randomness (currently xorshift of slot)

- Deploy on Mainnet
