import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Types } from "aptos";
// Internal components
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { writeMessageSimple, writeMessageComplex, writeMessageFailing } from "@/entry-functions/writeMessage";

type TransactionResult = {
  type: string;
  hash: string;
  gasUsed: string;
  maxGasAmount: string;
  gasRefund: string;
  success: boolean;
  error?: string;
};

export function GasRefundDemo() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [messageContent, setMessageContent] = useState<string>("Test message");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transactionResults, setTransactionResults] = useState<TransactionResult[]>([]);

  const executeTransaction = async (type: string, transactionFn: any) => {
    if (!account || !messageContent) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect wallet and enter a message",
      });
      return;
    }

    setIsLoading(true);
    try {
      const committedTransaction = await signAndSubmitTransaction(
        transactionFn({
          content: messageContent,
        })
      );

      let success = true;
      let error = "";
      let txnResult: any;

      try {
        // Wait for transaction to be confirmed
        await aptosClient().waitForTransaction({
          transactionHash: committedTransaction.hash,
        });
        
        // Get transaction details
        txnResult = await aptosClient().getTransactionByHash({
          transactionHash: committedTransaction.hash,
        });
      } catch (e: any) {
        success = false;
        error = e.message || "Transaction failed";
        // For failed transactions, we still need to fetch the transaction to get gas info
        try {
          txnResult = await aptosClient().getTransactionByHash({
            transactionHash: committedTransaction.hash,
          });
        } catch (err) {
          console.error("Failed to get transaction details:", err);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to get transaction details",
          });
          setIsLoading(false);
          return;
        }
      }

      // Calculate gas used and refund
      const gasUsed = txnResult.gas_used || "0";
      const maxGasAmount = txnResult.max_gas_amount || "0";
      const gasRefund = BigInt(maxGasAmount) - BigInt(gasUsed);

      const result: TransactionResult = {
        type,
        hash: committedTransaction.hash,
        gasUsed,
        maxGasAmount,
        gasRefund: gasRefund.toString(),
        success,
        error,
      };

      setTransactionResults(prev => [result, ...prev]);

      toast({
        title: success ? "Success" : "Transaction Failed",
        description: `Transaction ${success ? "succeeded" : "failed"}, hash: ${committedTransaction.hash}`,
        variant: success ? "default" : "destructive",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit transaction",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <CardHeader className="p-0">
        <CardTitle>Gas Refund Demonstration</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Message Content</label>
          <Input
            disabled={!account || isLoading}
            value={messageContent}
            placeholder="Enter a message"
            onChange={(e) => setMessageContent(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            disabled={!account || isLoading || messageContent.length === 0}
            onClick={() => executeTransaction("Simple", writeMessageSimple)}
          >
            Simple Transaction
          </Button>
          <Button
            variant="outline"
            disabled={!account || isLoading || messageContent.length === 0}
            onClick={() => executeTransaction("Complex", writeMessageComplex)}
          >
            Complex Transaction
          </Button>
          <Button
            variant="outline"
            disabled={!account || isLoading || messageContent.length === 0}
            onClick={() => executeTransaction("Failing", writeMessageFailing)}
          >
            Failing Transaction
          </Button>
        </div>

        {transactionResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Transaction Results</h3>
            <div className="space-y-4">
              {transactionResults.map((result, index) => (
                <Card key={index} className={`border-l-4 ${result.success ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{result.type} Transaction</span>
                        <span className={result.success ? 'text-green-500' : 'text-red-500'}>
                          {result.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        Hash: {result.hash}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                          <div className="text-xs text-gray-500">Gas Used</div>
                          <div className="font-medium">{result.gasUsed}</div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                          <div className="text-xs text-gray-500">Max Gas</div>
                          <div className="font-medium">{result.maxGasAmount}</div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                          <div className="text-xs text-gray-500">Gas Refund</div>
                          <div className="font-medium">{result.gasRefund}</div>
                        </div>
                      </div>
                      {!result.success && result.error && (
                        <div className="mt-2 text-sm text-red-500">
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
}
