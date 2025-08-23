import { useAlertStore } from "@/store/alertStore";
import { useSwapStore } from "@/store/swapStore";
import { useWalletStore } from "@/store/walletStore";

const CONTRACT_ACCOUNT = "achu";
const ACTION_NAME = "achuswap";

// small helpers
const isEosioName = (s: string) => /^[a-z1-5.]{1,12}$/.test(s);
const toNumber = (v: number | string | undefined) =>
  typeof v === "number" ? v : v ? parseFloat(v) : NaN;
const fmtAsset = (amt: number | string | undefined, symbol: string, precision = 4) => {
  const n = toNumber(amt);
  if (!Number.isFinite(n)) throw new Error(`Invalid amount for ${symbol}: ${amt}`);
  return `${n.toFixed(precision)} ${symbol}`;
};

type TokenLike = {
  symbol: string;
  amount?: number | string;
  contract?: string;
  precision?: number;
};

const buildOrdersObject = () => {
  const { getSellToken, getBuyToken } = useSwapStore.getState();

  const sellToken: TokenLike = getSellToken();
  const buyToken: TokenLike = getBuyToken();

  // basic validations
  if (!sellToken?.symbol) throw new Error("sellToken.symbol missing");
  if (!buyToken?.symbol) throw new Error("buyToken.symbol missing");

  const tokenContract = sellToken.contract || "eosio.token"; // default if not provided
  if (!isEosioName(tokenContract)) {
    throw new Error(`tokenContract is not a valid EOSIO name: ${tokenContract}`);
  }

  const sellPrecision = sellToken.precision ?? 4;
  const buyPrecision = buyToken.precision ?? 4;

  const quantity = fmtAsset(sellToken.amount, sellToken.symbol, sellPrecision);
  const desired = toNumber(buyToken.amount);
  if (!Number.isFinite(desired)) throw new Error("buyToken.amount missing/invalid");

  // memo format: "<SELL><BUY>,<BUY_AMOUNT>"
  const memo = `${sellToken.symbol}${buyToken.symbol},${desired!.toFixed(buyPrecision)}`;

  const order = {
    tokenContract,      // REQUIRED by ABI (type: name)
    to: "proton.swaps", // destination contract/name (adjust if needed)
    quantity,           // asset string, correct precision & symbol
    memo                // string
  };

  return [order];
};

const executeSwap = async () => {

  const { session, user } = useWalletStore.getState();
  if (!user) { useAlertStore.getState().showAlert("Login first", "error"); return; }
  if (!session || typeof session.transact !== "function") {
    useAlertStore.getState().showAlert("No active wallet session", "error"); return;
  }

  const auth = session.auth;                            // PermissionLevel
  const from = auth.actor.toString();

  const orders = buildOrdersObject();
  console.log("session.auth:", {
    actor: auth.actor.toString(),
    permission: auth.permission.toString(),
  });

  const res = await session.transact({
    actions: [{
      account: CONTRACT_ACCOUNT,                        // 'achu'
      name: ACTION_NAME,                                // 'achuswap'
      authorization: [auth],                            // ✅ user signs
      data: { from, orders }                            // matches requireAuth(from)
    }]
  }, { broadcast: true });

  console.log("signatures:", res.signatures);           // should be non-empty
};

export default executeSwap;
