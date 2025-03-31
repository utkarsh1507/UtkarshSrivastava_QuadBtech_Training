use anchor_lang::prelude::*;

declare_id!("Dt7VPZSi8DmFh5ACN816T1hPmBSdvVLCXq4jkkFgTsM3");

#[program]
pub mod hello_world {
    use super::*;
    pub fn say_hello(ctx: Context<Hello>) -> Result<()> {
        msg!("Hello, Solana!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Hello {}
