import { useWalletStore } from "@/store/walletStore";
import { Popover, PopoverButton, PopoverPanel, } from '@headlessui/react'

export default function Profile() {

    const { user } = useWalletStore();

    return (
        <div className="flex justify-center">
            <div className="flex gap-8">
                <Popover>
                    <PopoverButton className="block text-2xl font-semibold text-white/50 focus:outline-none data-[active]:text-white data-[hover]:text-white data-[focus]:outline-1 data-[focus]:outline-white">
                        {user?.acc.toUpperCase()}
                    </PopoverButton>
                    <PopoverPanel
                        transition
                        anchor="bottom"
                        className="divide-y divide-white/5 rounded-xl bg-white/5 text-sm/6 transition duration-200 ease-in-out [--anchor-gap:var(--spacing-5)] data-[closed]:-translate-y-1 data-[closed]:opacity-0"
                    >
                        <div className="p-3">
                            <a className="block rounded-lg py-2 px-3 transition hover:bg-white/5" href="#">
                                <p className="font-semibold text-white">XPR Balance</p>
                                <p className="text-white/50">5000.0000</p>
                            </a>
                            <a className="block rounded-lg py-2 px-3 transition hover:bg-white/5" href="#">
                                <p className="font-semibold text-white">Wallet</p>
                            </a>
                            <a className="block rounded-lg py-2 px-3 transition hover:bg-white/5" href="#">
                                <p className="font-semibold text-white">Transactions</p>
                            </a>
                        </div>
                        <div className="p-3">
                            <a className="block rounded-lg py-2 px-3 transition hover:bg-white/5" href="#">
                                <p className="font-semibold text-white">Logout</p>
                            </a>
                        </div>
                    </PopoverPanel>
                </Popover>
            </div>
        </div>
    )
}
