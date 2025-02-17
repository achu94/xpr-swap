import { Swap } from "./Swap";
import { ChooseToken } from "./ChooseToken";

export function SwapContainer() {
  return (
    <div>
      <ChooseToken />
      <h1 className="text-4xl px-4">
        Swap <span className="text-lg">(testnet)</span>
      </h1>
      <Swap />
    </div>
  );
}
