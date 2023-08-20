use std::ops::{Div, Mul};

/// Converts a `u64` value - in this case the balance of a token account - into
/// an `f32` by using the `decimals` value of its associated mint to get the
/// nominal quantity of a mint stored in that token account
///
/// For example, a token account with a balance of 10,500 for a mint with 3
/// decimals would have a nominal balance of 10.5
pub fn convert_to_float(value: u64, decimals: u8) -> f32 {
    (value as f32).div(f32::powf(10.0, decimals as f32))
}

/// Converts a nominal value - in this case the calculated value `r` - into a
/// `u64` by using the `decimals` value of its associated mint to get the real
/// quantity of the mint that the user will receive
///
/// For example, if `r` is calculated to be 10.5, the real amount of the asset
/// to be received by the user is 10,500
pub fn convert_from_float(value: f32, decimals: u8) -> u64 {
    value.mul(f32::powf(10.0, decimals as f32)) as u64
}

pub fn xorshift64star(seed: u64) -> u64 {
    let mut x = seed;
    x ^= x << 12;
    x ^= x >> 25;
    x ^= x << 27;
    x = (x as u128 * 0x2545F4914F6CDD1D) as u64;
    return x;
}

pub fn xorshift(seed: u64, max_value: u64) -> u64 {
    let output = xorshift64star(seed);
    let random_number = output % max_value;
    return random_number
}
