// import { session } from "@/webSdk";
import { useUserStore } from "@/store/userStore"; // Ensure correct path
import { useAlertStore } from "@/store/alertStore";
import { useSwapStore } from "@/store/swapStore";
import { useWalletStore } from "@/store/walletStore";

const buildOrdersObject = () => {
  const { getSellToken, getBuyToken } = useSwapStore.getState();

  const sellToken = getSellToken();
  const buyToken = getBuyToken();

  return [
    {
      tokenContract: sellToken.contract,
      to: "proton.swaps",
      quantity: `${sellToken.amount?.toFixed(4)} ${sellToken.symbol}`,
      memo: `${sellToken.symbol}${buyToken.symbol},${buyToken.amount?.toFixed(4)}`
    }
  ];
}

const executeSwap = async () => {
  const { actor, permission } = useUserStore.getState();
  const { session, user } = useWalletStore.getState();

  if (!user) {
    useAlertStore.getState().showAlert("User is not logged in. Please log in first.", "error");
    return;
  }

  useAlertStore.getState().showAlert("Executing swap for user:" + actor, "info");
  console.log("Session object:", session);

  if (!session || typeof session.transact !== "function") {
    useAlertStore.getState().showAlert("⚠️ session.transact is not available. Is the session properly initialized?", "error");
    return;
  }

  try {
    const result = await session.transact(
      {
        actions: [
          {
            account: "achu",
            name: "achuswap",
            authorization: [
              {
                actor: actor,
                permission: permission || "active",
              },
            ],
            data: {
              from: actor,
              orders: buildOrdersObject()
            },
          },
        ],
      }
    );

    useAlertStore.getState().showAlert("✅ Transaction Success: " + result.transaction.id, "success");
  } catch (error) {
    useAlertStore.getState().showAlert("Transaction Failed:", "error");
    console.error("Transaction Failed:", error);
  }
};




export default executeSwap;
