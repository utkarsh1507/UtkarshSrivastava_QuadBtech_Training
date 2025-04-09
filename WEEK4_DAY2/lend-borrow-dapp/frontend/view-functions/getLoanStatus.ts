import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "@/constants";

export const hasActiveLoan = async (
  network: Network,
  address: string
): Promise<boolean> => {
  const aptos = new Aptos(new AptosConfig({ network }));
  
  try {
    const response = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::borrow::has_active_loan`,
        functionArguments: [address],
      },
    });
    
    return response[0] as boolean;
  } catch (error) {
    console.error("Error checking loan status:", error);
    return false;
  }
};

export const getLoanAmount = async (
  network: Network,
  address: string
): Promise<bigint> => {
  const aptos = new Aptos(new AptosConfig({ network }));
  
  try {
    const response = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::borrow::get_loan_amount`,
        functionArguments: [address],
      },
    });
    
    return BigInt(response[0] as string);
  } catch (error) {
    console.error("Error fetching loan amount:", error);
    return BigInt(0);
  }
};
