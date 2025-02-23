import BigNumber from "bignumber.js";
import { useSwapStore } from "@/store/swapStore";
import { useAlertStore } from "@/store/alertStore";
import CurrencyGraph from "./CurrencyGraph";
import { useWalletStore } from "@/store/walletStore";

export async function fetchSwapRate({ token1, token2, amount }: { token1: string; token2: string; amount: number; }) {

  const rpc = useWalletStore.getState().rpc;

  const rpcParams = {
    code: "proton.swaps",
    scope: "proton.swaps",
    table: "pools",
    limit: 100,
    json: true
  };

  const poolMemo = `${token1}<>${token2}`;

  return rpc.get_table_rows(rpcParams).then(async (rows) => {

    const graph = new CurrencyGraph(rows.rows);

    console.log(token1, token2, amount)

    try {
      const currency = graph.convertCurrency(token1, token2, amount);
      console.log(currency);
      console.log(`Converted amount: ${currency.amount}`);
      console.log(`Conversion path: ${currency.path.join(' -> ')}`);

      const priceInDollarToken1 = graph.convertCurrency(token1, "XUSDC", amount);
      const priceInDollarToken2 = graph.convertCurrency(token2, "XUSDC", currency.amount);

      const token1Price = priceInDollarToken1.amount;
      const token2Price = priceInDollarToken2.amount;
      const priceImpact = token1Price / token2Price;

      useSwapStore.getState().setSwapRate(priceImpact.toFixed(2));
      useSwapStore.getState().setPath(currency.path.join(' -> '))

      useSwapStore.getState().setSellToken({
        priceInDollar: parseFloat(token1Price.toFixed(4)),
        symbol: token1,
        amount: amount
      });

      useSwapStore.getState().setBuyToken({
        priceInDollar: parseFloat(token2Price.toFixed(4)),
        symbol: token2,
        amount: parseFloat(currency.amount.toFixed(4))
      });

      return parseFloat(currency.amount.toFixed(4));


    } catch (error) {
      console.error(error);
    }
    return;


    const pool = rows.rows.find((p) => p.memo === poolMemo);

    if (!pool || !pool.pool1 || !pool.pool2 || !pool.pool1.quantity || !pool.pool2.quantity) {
      console.error("⚠️ Pool not found!");
      useAlertStore.getState().showAlert("Pool not found!", "error");
      return 0;
    }

    return;

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

    return finalToken2Out.toFixed(8);
  }).catch((error) => {
    console.error("Error fetching swap rate:", error);
    return 0;
  });
}
