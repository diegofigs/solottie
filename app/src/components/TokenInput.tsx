import React from "react";
import Image from "next/image";

type TokenInputProps = {
  label?: string;
  mint: string;
  value: string;
  balance: number;
  onInputChange: (value: string) => void;
};

export function TokenInput({
  label,
  mint,
  value,
  balance,
  onInputChange,
}: TokenInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e.target.value);
  };

  const handleMaxClick = () => {
    const maxAmount = balance.toString();
    onInputChange(maxAmount);
  };

  return (
    <div>
      <div className="w-full flex justify-end">
        <small className="text-right text-xs mr-1 mb-1">
          Balance: {balance}
        </small>
      </div>
      <div className="flex justify-around gap-2 items-center space-x-0 bg-gray-800 p-2 rounded-lg">
        <Image
          src={`https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${mint}/logo.png`}
          alt={`${label} icon`}
          width={24}
          height={24}
        />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          className="w-40 p-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none"
          placeholder="Enter amount"
        />
        <button
          onClick={handleMaxClick}
          className="text-sm px-2 py-1 bg-gradient-to-br from-gray-600 to-gray-500 text-black rounded-3xl hover:bg-gray-400 focus:outline-none"
        >
          Max
        </button>
      </div>
    </div>
  );
}
