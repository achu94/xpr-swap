/* eslint-disable react-hooks/rules-of-hooks */
import { useTradingPairStore, type TradingPairType } from "@/store/tradingPairStore";
import { useTokenStore, type Token } from "@/store/tokenStore";
import { rpc } from "../webSdk";

export async function setTradingPairs() {
  const addPair = useTradingPairStore.getState().addPair;
  const addToken = useTokenStore.getState().addToken;

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

    const tokenSymbol = pair.pool1.quantity?.split(" ")[1];
    const tokenContract = pair.pool1.contract;
    
    if (tokenSymbol && tokenContract) {
      const token: Token = {
        symbol: tokenSymbol,
        contract: tokenContract,
      }
      addToken(token);
    }
    
    const tokenSymbol2 = pair.pool2.quantity?.split(" ")[1];
    const tokenContract2 = pair.pool2.contract;
    
    if (tokenSymbol2 && tokenContract2) {
      const token: Token = {
        symbol: tokenSymbol2,
        contract: tokenContract2,
      }
      addToken(token);
    }

  });
}