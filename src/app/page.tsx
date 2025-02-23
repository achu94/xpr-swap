"use client";
import { useEffect } from "react";

import { SwapContainer } from "@/components/swap/SwapContainer";
import { Header } from "../components/Header";
// import { Footer } from "../components/Footer";
import { setTradingPairs } from "@/atoms/tradingPairs";
import { GlobalAlert } from "@/components/GlobalAlert";
import { useWalletStore } from "@/store/walletStore";

export default function Home() {

  const { reconnect } = useWalletStore();
  
  useEffect(() => {
    reconnect();

    setTradingPairs();
  }, []);

  return (
    <>
      <GlobalAlert />
      <Header />
      <div className="grid grid-rows-[20px_.5fr_20px] items-center justify-items-center sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <SwapContainer />
        </main>
      </div>
      {/* <Footer /> */}
    </>
  );
}
