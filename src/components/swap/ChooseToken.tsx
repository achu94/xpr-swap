import {
  Field,
  Fieldset,
  Input,
  Legend,
  Button,
  Dialog,
} from "@headlessui/react";
import { useDialogStore } from "@/store/dialogStore";
import { useTokenStore, Token } from "@/store/tokenStore";
import { useSwapStore } from "@/store/swapStore";

export function ChooseToken() {
  const { isOpen, setDialog, tokenTyp } = useDialogStore();
  const tokens = useTokenStore((state) => state.tokens);

  const setSellToken = useSwapStore((state) => state.setSellToken);
  const setBuyToken = useSwapStore((state) => state.setBuyToken);

  const chooseHandler = (token: Token) => {
    if (tokenTyp === "buy") {
      setBuyToken(token);
    } else {
      setSellToken(token);
    }

    setDialog(false);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => setDialog(false)}
      className="relative z-50 w-full max-w-lg px-4"
    >
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <Fieldset className="space-y-6">
            <Legend className="text-base font-semibold ">
              <div className="flex justify-between">
                <p>Select a token</p>
                <Button
                  onClick={() => setDialog(false)}
                  className="border px-1 rounded-lg"
                >
                  X
                </Button>
              </div>
              <p className="text-sm text-gray-400">
                Select a token from our default list or search for a token by
                symbol or address.
              </p>
            </Legend>
            <Field>
              <Input
                className="bg-gray-700 rounded-lg p-2 w-full"
                placeholder="Search by token"
              />
            </Field>
            <Field>
              <p className="text-sm text-gray-400">Trending Tokens</p>
              <ul className="border p-4 text-lg rounded-xl bg-gray-700">
                {tokens.map((token) => (
                  <li
                    className="text-xl p-2 hover:border hover:rounded-lg cursor-pointer"
                    key={token.symbol}
                    onClick={() => chooseHandler(token)}
                  >
                    <button>{token.symbol}</button>
                  </li>
                ))}
              </ul>
            </Field>
          </Fieldset>
        </div>
      </div>
    </Dialog>
  );
}
