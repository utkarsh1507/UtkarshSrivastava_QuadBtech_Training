import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { lendFunds } from "@/entry-functions/lendFunds";
import { borrowFunds } from "@/entry-functions/borrowFunds";
import { repayLoan } from "@/entry-functions/repayLoan";
import { getPoolFunds } from "@/view-functions/getPoolFunds";
import { hasActiveLoan, getLoanAmount } from "@/view-functions/getLoanStatus";
import { useQuery } from "@tanstack/react-query";

export function LendBorrow() {
  const { toast } = useToast();
  const { account, network, signAndSubmitTransaction } = useWallet();
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query to get the current pool funds
  const { data: poolFunds, refetch: refetchPoolFunds } = useQuery({
    queryKey: ["poolFunds", network?.name],
    queryFn: () => {
      if (!network) return BigInt(0);
      return getPoolFunds(network.name as Network);
    },
    enabled: !!network,
  });

  // Query to check if user has an active loan
  const { data: activeLoan, refetch: refetchLoanStatus } = useQuery({
    queryKey: ["activeLoan", network?.name, account?.address],
    queryFn: async () => {
      if (!network || !account) return false;
      return hasActiveLoan(network.name as Network, account.address.toString());
    },
    enabled: !!network && !!account,
  });

  // Query to get loan amount if user has an active loan
  const { data: loanAmount, refetch: refetchLoanAmount } = useQuery({
    queryKey: ["loanAmount", network?.name, account?.address, activeLoan],
    queryFn: async () => {
      if (!network || !account || !activeLoan) return BigInt(0);
      return getLoanAmount(network.name as Network, account.address.toString());
    },
    enabled: !!network && !!account && !!activeLoan,
  });

  const handleLend = async () => {
    if (!account || !network) return;
    
    try {
      setIsSubmitting(true);
      
      // Convert amount to octas (1 APT = 10^8 octas)
      const amountInOctas = (parseFloat(amount) * 100_000_000).toString();
      
      const transaction = lendFunds({
        amount: amountInOctas,
      });
      
      const result = await signAndSubmitTransaction(transaction);
      
      toast({
        title: "Deposit successful!",
        description: `Transaction hash: ${result.hash}`,
      });
      
      // Refetch pool funds after successful deposit
      refetchPoolFunds();
      
      // Reset form
      setAmount("");
    } catch (error: any) {
      toast({
        title: "Deposit failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBorrow = async () => {
    if (!account || !network) return;
    
    try {
      setIsSubmitting(true);
      
      // Convert amount to octas (1 APT = 10^8 octas)
      const amountInOctas = (parseFloat(amount) * 100_000_000).toString();
      
      const transaction = borrowFunds({
        amount: amountInOctas,
      });
      
      const result = await signAndSubmitTransaction(transaction);
      
      toast({
        title: "Borrow successful!",
        description: `Transaction hash: ${result.hash}`,
      });
      
      // Refetch data after successful borrow
      refetchPoolFunds();
      refetchLoanStatus();
      refetchLoanAmount();
      
      // Reset form
      setAmount("");
    } catch (error: any) {
      toast({
        title: "Borrow failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRepay = async () => {
    if (!account || !network) return;
    
    try {
      setIsSubmitting(true);
      
      const transaction = repayLoan();
      
      const result = await signAndSubmitTransaction(transaction);
      
      toast({
        title: "Repayment successful!",
        description: `Transaction hash: ${result.hash}`,
      });
      
      // Refetch data after successful repayment
      refetchPoolFunds();
      refetchLoanStatus();
      
      // Reset form
      setAmount("");
    } catch (error: any) {
      toast({
        title: "Repayment failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Lend & Borrow</CardTitle>
        <CardDescription>
          Lend or borrow APT tokens
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Pool Info */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <div className="flex justify-between">
              <span className="font-medium">Pool Balance:</span>
              <span>
                {poolFunds !== undefined
                  ? `${(Number(poolFunds) / 100_000_000).toFixed(8)} APT`
                  : "Loading..."}
              </span>
            </div>
            
            {activeLoan && (
              <div className="flex justify-between mt-2">
                <span className="font-medium">Your Loan:</span>
                <span>
                  {loanAmount !== undefined
                    ? `${(Number(loanAmount) / 100_000_000).toFixed(8)} APT`
                    : "Loading..."}
                </span>
              </div>
            )}
          </div>
          
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (APT)</label>
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleLend}
              disabled={!account || isSubmitting || !amount || parseFloat(amount) <= 0}
              className="w-full"
            >
              Lend
            </Button>
            
            <Button
              onClick={handleBorrow}
              disabled={
                !account || 
                isSubmitting || 
                !amount || 
                parseFloat(amount) <= 0 ||
                !!activeLoan ||
                (poolFunds !== undefined && parseFloat(amount) > Number(poolFunds) / 100_000_000)
              }
              className="w-full"
              variant="secondary"
            >
              Borrow
            </Button>
          </div>
          
          {/* Repay Button */}
          {activeLoan && (
            <Button
              onClick={handleRepay}
              disabled={!account || isSubmitting}
              className="w-full mt-2"
              variant="outline"
            >
              Repay Loan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
