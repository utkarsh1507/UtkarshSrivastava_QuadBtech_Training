import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "@/constants";

export const getPoolFunds = async (network: Network): Promise<bigint> => {
  const aptos = new Aptos(new AptosConfig({ network }));
  
  try {
    const response = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::lend::get_pool_funds`,
        functionArguments: [],
      },
    });
    
    return BigInt(response[0] as string);
  } catch (error) {
    console.error("Error fetching pool funds:", error);
    return BigInt(0);
  }
};
