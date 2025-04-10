import type { Network } from "@aptos-labs/wallet-adapter-react";

export const NETWORK: Network = (process.env.NEXT_PUBLIC_APP_NETWORK as Network) ?? "testnet";
export const MODULE_ADDRESS = "0xe81c5ff0ba862e4bf68576b262b9e30defd80e5f01988e51088c4beff0158d2b";
export const APTOS_API_KEY = process.env.NEXT_PUBLIC_APTOS_API_KEY;
