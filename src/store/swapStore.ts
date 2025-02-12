import { create } from "zustand";
import { combine } from "zustand/middleware";

export interface Token {
  symbol: string;
  priceInDollar?: string;
  amount?: string;
  imgPath?: string;
}

interface SwapStore {
  sellToken: Token;
  buyToken: Token;
  marketFee?: number;
  swapFee?: number;
  slippage?: number;
}

interface SwapAction {
  setSellToken: (token: Token) => void;
  setBuyToken: (token: Token) => void;
  setMarketFee: (marketFee: number) => void;
  setSwapFee: (swapFee: number) => void;
  setSlippage: (slippage: number) => void;

  getSellToken: () => Token;
  getBuyToken: () => Token;
  getMarketFee: () => number | undefined;
  getSwapFee: () => number | undefined;
  getSlippage: () => number | undefined;
}

interface SwapStore {
  sellToken: Token;
  buyToken: Token;
  marketFee?: number;
  swapFee?: number;
  slippage?: number;
  swapRate?: string;  // Add swapRate to store state
}

interface SwapAction {
  setSellToken: (token: Token) => void;
  setBuyToken: (token: Token) => void;
  setMarketFee: (marketFee: number) => void;
  setSwapFee: (swapFee: number) => void;
  setSlippage: (slippage: number) => void;
  setSwapRate: (rate: string) => void; // Add action to set swap rate

  getSellToken: () => Token;
  getBuyToken: () => Token;
  getMarketFee: () => number | undefined;
  getSwapFee: () => number | undefined;
  getSlippage: () => number | undefined;
  getSwapRate: () => string | undefined; // Getter for swap rate
}

export const useSwapStore = create(
  combine<SwapStore, SwapAction>(
    {
      sellToken: { symbol: "" },
      buyToken: { symbol: "" },
      marketFee: undefined,
      swapFee: undefined,
      slippage: undefined,
      swapRate: undefined,  // Initialize swapRate in the store
    },
    (set, get) => ({
      setSellToken: (token) => {
        const currentSellToken = get().sellToken;
        if (!currentSellToken.symbol) {
          set({ sellToken: token });
        }
      },
      setBuyToken: (token) => {
        const currentBuyToken = get().buyToken;
        if (!currentBuyToken.symbol) {
          set({ buyToken: token });
        }
      },
      setMarketFee: (marketFee) => set({ marketFee }),
      setSwapFee: (swapFee) => set({ swapFee }),
      setSlippage: (slippage) => set({ slippage }),
      setSwapRate: (rate) => set({ swapRate: rate }), // Set swap rate in the store

      getSellToken: () => get().sellToken,
      getBuyToken: () => get().buyToken,
      getMarketFee: () => get().marketFee,
      getSwapFee: () => get().swapFee,
      getSlippage: () => get().slippage,
      getSwapRate: () => get().swapRate, // Getter for swap rate
    })
  )
);
