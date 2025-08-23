import { create } from "zustand";
import { combine } from "zustand/middleware";

export interface Token {
  symbol: string;
  priceInDollar?: number;
  amount?: number;
  imgPath?: string;
  contract?: string;
}

interface SwapStore {
  sellToken: Token;
  buyToken: Token;
  marketFee?: number;
  swapFee?: number;
  slippage?: number;
  swapRate?: string;
  path?: string;
}

interface SwapAction {
  setSellToken: (token: Token) => void;
  setBuyToken: (token: Token) => void;
  setMarketFee: (marketFee: number) => void;
  setSwapFee: (swapFee: number) => void;
  setSlippage: (slippage: number) => void;
  setSwapRate: (rate: string) => void;
  setPath: (path: string) => void;

  getSellToken: () => Token;
  getBuyToken: () => Token;
  getMarketFee: () => number | undefined;
  getSwapFee: () => number | undefined;
  getSlippage: () => number | undefined;
  getSwapRate: () => string | undefined;
  getPath: () => string | undefined;
}

export const useSwapStore = create(
  combine<SwapStore, SwapAction>(
    {
      sellToken: { symbol: "" },
      buyToken: { symbol: "" },
      marketFee: undefined,
      swapFee: undefined,
      slippage: undefined,
      swapRate: undefined,
      path: undefined,
    },
    (set, get) => ({
      setSellToken: (token) => {
        if (!token) return;
        set((state) => ({
          sellToken: {
            ...state.sellToken,                          // bisherige Felder behalten
            ...token,                                    // neue/aktualisierte Felder übernehmen
            ...(token.priceInDollar !== undefined        // 0 zulassen
              ? { priceInDollar: token.priceInDollar }
              : {})
          }
        }));
      },
      setBuyToken: (token) => {
        const current = get().buyToken;
        if (!token) return;
        const next = {
          ...current,
          ...token,
          ...(token.priceInDollar !== undefined ? { priceInDollar: token.priceInDollar } : {})
        };
        set({ buyToken: next });
      },
      setMarketFee: (marketFee) => set({ marketFee }),
      setSwapFee: (swapFee) => set({ swapFee }),
      setSlippage: (slippage) => set({ slippage }),
      setSwapRate: (rate) => set({ swapRate: rate }),
      setPath: (path) => set({ path }),

      getSellToken: () => get().sellToken,
      getBuyToken: () => get().buyToken,
      getMarketFee: () => get().marketFee,
      getSwapFee: () => get().swapFee,
      getSlippage: () => get().slippage,
      getSwapRate: () => get().swapRate,
      getPath: () => get().path
    })
  )
);
