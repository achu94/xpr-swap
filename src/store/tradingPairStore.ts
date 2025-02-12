import { create } from "zustand";
import { combine } from "zustand/middleware";

interface PoolType {
  quantity: string | undefined;
  contract: string | undefined;
}

interface FeeType {
  exchange_fee: number | null;
  add_liquidity_fee: number | null;
  remove_liquidity_fee: number | null;
}

export interface TradingPairType {
  lt_symbol: string | undefined;
  creator: string | undefined;
  memo: string | undefined;
  pool1: PoolType;
  pool2: PoolType;
  hash: string | undefined;
  fee: FeeType;
  active: number | null;
  amplifier: number | null;
}

interface TradingPairState {
  pairs: TradingPairType[];
}

interface TradingPairActions {
  addPair: (tradingPair: Partial<TradingPairType>) => void;
}

export const useTradingPairStore = create(
  combine<TradingPairState, TradingPairActions>(
    { pairs: [] },
    (set) => ({
      addPair: (tradingPair: Partial<TradingPairType>) =>
        set((state) => ({
          pairs: [
            ...state.pairs,
            {
              lt_symbol: tradingPair.lt_symbol ?? undefined,
              creator: tradingPair.creator ?? undefined,
              memo: tradingPair.memo ?? undefined,
              pool1: tradingPair.pool1 ?? { quantity: undefined, contract: undefined },
              pool2: tradingPair.pool2 ?? { quantity: undefined, contract: undefined },
              hash: tradingPair.hash ?? undefined,
              fee: tradingPair.fee ?? {
                exchange_fee: null,
                add_liquidity_fee: null,
                remove_liquidity_fee: null,
              },
              active: tradingPair.active ?? null,
              amplifier: tradingPair.amplifier ?? null,
            },
          ],
        })),
    })
  )
);
