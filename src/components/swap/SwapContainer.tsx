import { Swap } from "./Swap";
import { ChooseToken } from "./ChooseToken";

export function SwapContainer() {
  return (
    <div className="p-6">
      <ChooseToken />
      <h1 className="text-4xl">Swap</h1>
      <Swap />
    </div>
  );
}
