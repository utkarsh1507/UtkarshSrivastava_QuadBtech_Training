import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Header } from "@/components/Header";
import { SimpleLendBorrow } from "@/components/SimpleLendBorrow";

function App() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto py-8">
        {connected ? (
          <SimpleLendBorrow />
        ) : (
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
            <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600">
              To get started, please connect your wallet using the button in the header.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
