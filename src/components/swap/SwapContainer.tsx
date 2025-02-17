import { Swap } from "./Swap";
import { ChooseToken } from "./ChooseToken";

export function SwapContainer() {
  return (
    <div>
      <ChooseToken />
      <h1 className="text-4xl px-4">Swap</h1>
      <Swap />
    </div>
  );
}
