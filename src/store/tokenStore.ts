import { create } from "zustand";
import { combine } from "zustand/middleware";

export interface Token {
  symbol: string;
  contract: string;
  priceInDollar?: number;
  amount?: string;
  imgPath?: string;
}

interface TokenActions {
  addToken: (token: Token) => void;
  removeToken: (symbol: string) => void;
  getToken: (symbol: string) => Token | undefined;
}

interface TokenList {
  tokens: Token[];
}

export const useTokenStore = create(
  combine<TokenList, TokenActions>(
    { tokens: [] },
    (set, get) => ({
      addToken: (token) =>
        set((state) => {
          if (!state.tokens.find((t) => t.symbol === token.symbol)) {
            return { tokens: [...state.tokens, token] };
          }
          return state;
        }),

      removeToken: (symbol) =>
        set((state) => ({ tokens: state.tokens.filter((t) => t.symbol !== symbol) })),

      getToken: (symbol) => get().tokens.find((t) => t.symbol === symbol),
    })
  )
);