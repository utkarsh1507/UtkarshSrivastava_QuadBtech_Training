import { Info } from "lucide-react";

export function TopBanner() {
  return (
    <div className="bg-blue-600 py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Info className="h-5 w-5 flex-shrink-0 text-white" />
          <span className="font-medium text-sm sm:text-base text-white">
            Aptos Gas Tracker - Demonstrate gas usage and refund mechanisms on Aptos blockchain
          </span>
        </div>
        <div className="ml-4 flex-shrink-0"></div>
      </div>
    </div>
  );
}
