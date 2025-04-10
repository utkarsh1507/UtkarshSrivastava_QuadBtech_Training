import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export type WriteMessageArguments = {
  content: string; // the content of the message
};

export const writeMessageSimple = (args: WriteMessageArguments): InputTransactionData => {
  const { content } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::message_board::post_message_simple`,
      functionArguments: [content],
    },
  };
};

export const writeMessageComplex = (args: WriteMessageArguments): InputTransactionData => {
  const { content } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::message_board::post_message_complex`,
      functionArguments: [content],
    },
  };
};

export const writeMessageFailing = (args: WriteMessageArguments): InputTransactionData => {
  const { content } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::message_board::post_message_failing`,
      functionArguments: [content],
    },
  };
};
