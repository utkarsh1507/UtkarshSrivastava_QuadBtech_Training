import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export type LendFundsArguments = {
  amount: string; // amount in octas (1 APT = 10^8 octas)
};

export const lendFunds = (args: LendFundsArguments): InputTransactionData => {
  const { amount } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::lend::deposit_funds`,
      functionArguments: [amount],
    },
  };
};
