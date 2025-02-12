/* eslint-disable react-hooks/rules-of-hooks */
import { useTradingPairStore, type TradingPairType } from "@/store/tradingPairStore";
import { rpc } from "../webSdk";

export async function setTradingPairs() {
  const addPair = useTradingPairStore.getState().addPair;

  const rpcParams = {
    code: "proton.swaps",
    scope: "proton.swaps",
    table: "pools",
    limit: 100,
    json: true
  };

  const tradingPairsJson = await rpc.get_table_rows(rpcParams);
  const tradingPairRows = tradingPairsJson.rows;
  tradingPairRows.forEach((pair: TradingPairType) => {
    addPair(pair);
  });
}