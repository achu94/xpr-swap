import { Button, Input } from "@headlessui/react";
import { fetchSwapRate } from "@/atoms/fetchSwapRate";
import { useSwapStore } from "@/store/swapStore";
import { useEffect, useState } from "react";

export const Swap = () => {
  const [buyAmount, setBuyAmount] = useState("0.0");

  const sellToken = useSwapStore((state) => state.getSellToken());
  const buyToken = useSwapStore((state) => state.getBuyToken());
  const setSellToken = useSwapStore((state) => state.setSellToken);
  const setBuyToken = useSwapStore((state) => state.setBuyToken);
  // const swapRate = useSwapStore((state) => state.getSwapRate());

  // Default tokens to set if not already set
  useEffect(() => {
    if (!sellToken.symbol) {
      setSellToken({ symbol: "XPR" });
    }

    if (!buyToken.symbol) {
      setBuyToken({ symbol: "XMT" });
    }
  }, [sellToken, buyToken, setSellToken, setBuyToken]);

  let debounceTimer: NodeJS.Timeout | null = null;

  const handleAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    action: "Sell" | "Buy"
  ) => {
    let value = event.target.value;
    value = value.replace(/[^0-9.]/g, "");
    if (value.split(".").length > 2) return;

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      if (!value) return;
      const buyAmountReturn = await fetchSwapRate({
        token1: action === "Sell" ? sellToken.symbol : buyToken.symbol,
        token2: action === "Buy" ? sellToken.symbol : buyToken.symbol,
        amount: parseFloat(value),
      });

      if (buyAmountReturn) {
        setBuyAmount(buyAmountReturn.toString());
      }
    }, 500);
  };

  const containerClass =
    "bg-gray-800 text-gray-400 border rounded-xl p-4 text-1xl";
  const inputContainerClass = "flex justify-between items-center";
  const inputClass =
    "data-[focus]:ring-0 hover:border-none border-none bg-transparent text-gray-400 text-2xl w-3/5";
  const buttonClass =
    "rounded-full bg-slate-500 py-2 px-4 text-1xl text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700";

  return (
    <div className="min-w-96 flex flex-col gap-2">
      <h1 className="text-4xl"></h1>
      <div className={containerClass}>
        <p>Sell</p>
        <div className={inputContainerClass}>
          <Input
            id="Sell"
            placeholder="0.0"
            type="text"
            inputMode="decimal"
            pattern="[0-9]*"
            className={inputClass}
            onChange={(event) => handleAmountChange(event, "Sell")}
          />
          <Button className={buttonClass}>{sellToken.symbol}</Button>
        </div>
        <p>$0</p>
      </div>
      <div className={containerClass}>
        <p>Buy</p>
        <div className={inputContainerClass}>
          <Input
            value={buyAmount}
            id="Buy"
            placeholder="0.0"
            type="text"
            inputMode="decimal"
            pattern="[0-9]*"
            className={inputClass}
            onChange={(event) => handleAmountChange(event, "Buy")}
          />
          <Button className={buttonClass}>{buyToken.symbol}</Button>
        </div>
        <p>$0</p>
      </div>
    </div>
  );
};
