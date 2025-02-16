import { rpc } from "../webSdk";
import BigNumber from "bignumber.js";
import { useSwapStore } from "@/store/swapStore";
import { fetchPirceInDollar } from "./fetchPirceInDollar";
import { useAlertStore } from "@/store/alertStore";

export async function fetchSwapRate({ token1, token2, amount }: { token1: string; token2: string; amount: number; }) {
  const rpcParams = {
    code: "proton.swaps",
    scope: "proton.swaps",
    table: "pools",
    limit: 100,
    json: true
  };

  const poolMemo = `${token1}<>${token2}`;

  return rpc.get_table_rows(rpcParams).then(async (rows) => {
    const pool = rows.rows.find((p) => p.memo === poolMemo);

    if (!pool || !pool.pool1 || !pool.pool2 || !pool.pool1.quantity || !pool.pool2.quantity) {
      console.error("⚠️ Pool not found!");
      useAlertStore.getState().showAlert("Pool not found!", "error");
      return 0;
    }

    // Extract only numerical values from the pool quantities
    const x = new BigNumber(pool.pool1.quantity.split(" ")[0]);
    const y = new BigNumber(pool.pool2.quantity.split(" ")[0]);
    const inputAmount = new BigNumber(amount);

    if (inputAmount.isZero() || inputAmount.isNegative()) {
      console.error("⚠️ Invalid input amount!");
      return 0;
    }

    const newX = x.plus(inputAmount);
    const k = x.times(y);
    const newY = k.dividedBy(newX);
    const token2Out = y.minus(newY);

    // Apply exchange fee (if exists)
    const exchangeFee = pool.fee?.exchange_fee || 0;
    const feeMultiplier = new BigNumber(1).minus(new BigNumber(exchangeFee).dividedBy(10000));
    const finalToken2Out = token2Out.times(feeMultiplier);

    console.log(`💰 Swap Rate: ${amount} ${token1} → ${finalToken2Out.toFixed(8)} ${token2}`);

    useSwapStore.getState().setSellToken({
      symbol: token1,
      amount: amount,
      contract: pool.pool1.contract
    });
    
    useSwapStore.getState().setBuyToken({
      symbol: token2,
      amount: finalToken2Out.toNumber(),
      contract: pool.pool2.contract
    });

    await fetchPirceInDollar(token1, new BigNumber(amount)).then(price => {
      if (price) {
        useSwapStore.getState().setSellToken({
          priceInDollar: parseFloat(price.toString()),
          symbol: token1,
          amount: amount
        });

        return price;
      }
    });

    await fetchPirceInDollar(token2, finalToken2Out).then(price => {
      if (price) {
        useSwapStore.getState().setBuyToken({
          priceInDollar: parseFloat(price.toString()),
          symbol: token2,
          amount: finalToken2Out.toNumber()
        });

        return price;
      }
    });

    // if (token1Price && token2Price) {
    //   const rate = (token1Price / token2Price) * 100;
    //   useSwapStore.getState().setSwapRate(rate.toFixed(2));
    // }

    return finalToken2Out.toFixed(8);
  }).catch((error) => {
    console.error("Error fetching swap rate:", error);
    return 0;
  });
}
