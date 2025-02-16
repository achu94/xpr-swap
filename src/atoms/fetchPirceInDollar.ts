import { rpc } from "../webSdk";
import BigNumber, { type BigNumber as TypeBigNumber } from "bignumber.js";

export async function fetchPirceInDollar(token1: string, amount: TypeBigNumber) {
  const rpcParams = {
    code: "proton.swaps",
    scope: "proton.swaps",
    table: "pools",
    json: true
  };

  const poolMemo = `${token1}<>XUSDC`;

  return rpc.get_table_rows(rpcParams).then((rows) => {
    const pool = rows.rows.find((p) => p.memo === poolMemo);

    if (!pool || !pool.pool1 || !pool.pool2 || !pool.pool1.quantity || !pool.pool2.quantity) {
      console.log("⚠️ Pool not found!");
      return 0;
    }

    // Extract only numerical values from the pool quantities
    const x = new BigNumber(pool.pool1.quantity.split(" ")[0]);
    const y = new BigNumber(pool.pool2.quantity.split(" ")[0]);
    const inputAmount = new BigNumber(amount);

    const newX = x.plus(inputAmount);
    const k = x.times(y);
    const newY = k.dividedBy(newX);
    const token = y.minus(newY);

    return token.toNumber().toFixed(2);
  }).catch((error) => {
    console.error("Error fetching swap rate:", error);
    return 0;
  });
}
