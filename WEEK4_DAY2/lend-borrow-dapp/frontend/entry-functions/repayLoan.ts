import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export const repayLoan = (): InputTransactionData => {
  return {
    data: {
      function: `${MODULE_ADDRESS}::borrow::repay_loan`,
      functionArguments: [],
    },
  };
};
