import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export type BorrowFundsArguments = {
  amount: string; // amount in octas (1 APT = 10^8 octas)
};

export const borrowFunds = (args: BorrowFundsArguments): InputTransactionData => {
  const { amount } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::borrow::borrow_funds`,
      functionArguments: [amount],
    },
  };
};
