import { useWalletStore } from "@/store/walletStore";
import { Button } from "@headlessui/react";
import Profil from "./Profil";

export const Wallet = () => {

    const { session, login, isLoading } = useWalletStore();

    return (
        !session ? (
            <Button className="rounded bg-purple-800 py-2 px-4 text-sm text-white data-[hover]:bg-purple-500 data-[active]:bg-sky-700" onClick={login} disabled={isLoading}>
                {isLoading ? "Connecting..." : "Connect Wallet"}
            </Button>
        ) : (
            <Profil />
        )
    );
}