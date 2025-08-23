// useWalletStore.ts
import { create } from "zustand";
import ProtonWebSDK, { LinkSession, ProtonWebLink, Link } from "@proton/web-sdk";
import { JsonRpc, RpcInterfaces } from "@proton/js";
import { useUserStore } from '@/store/userStore';

const REQUEST_ACCOUNT = "achubestbp";

// // MAINNET
const CHAIN_ID = '384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0'
const ENDPOINTS = ['https://proton.greymass.com']

// TESTNET CONFIG
// const CHAIN_ID = "71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd";
// const ENDPOINTS = ["https://protontestnet.ledgerwise.io/"];

// eosjs JsonRpc expects a SINGLE url string (not an array)
const rpc = new JsonRpc(ENDPOINTS[0]);

interface WalletState {
    link?: ProtonWebLink | Link;
    session?: LinkSession;
    user?: RpcInterfaces.UserInfo; // keep for compatibility with your UI
    isLoading: boolean;
    error: string | null;
    rpc: JsonRpc;

    createLink: (restoreSession?: boolean) => Promise<void>;
    login: () => Promise<void>;
    reconnect: () => Promise<void>;
    logout: () => Promise<void>;
    transfer: (to: string, amount: string) => Promise<void>;
    fetchUser: (account: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
    link: undefined,
    session: undefined,
    user: undefined,
    isLoading: false,
    error: null,
    rpc,

    createLink: async (restoreSession = false) => {
        set({ isLoading: true, error: null });
        try {
            if (typeof window === "undefined") {
                throw new Error("Wallet can only be initialized in the browser.");
            }

            const { link, session } = await ProtonWebSDK({
                linkOptions: {
                    endpoints: ENDPOINTS,
                    chainId: CHAIN_ID,
                    restoreSession,
                },
                transportOptions: {
                    requestAccount: REQUEST_ACCOUNT,
                    requestStatus: false,
                },
                selectorOptions: {
                    appName: "Taskly",
                },
            });

            set({ link, session });

            // hydrate user store if session exists
            if (session?.auth?.actor) {
                const actor = String(session.auth.actor);
                const permission = session.auth.permission || "active";
                useUserStore.getState().setActor(actor);
                useUserStore.getState().setPermission(permission.toString());
                await get().fetchUser(actor); // sets wallet.user AND userStore.accountData
            }

            // (optional) keep your localStorage marker, but guard SSR
            try {
                if (typeof window !== "undefined" && session) {
                    localStorage.setItem("proton_session", "1");
                }
            } catch { }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error initializing link:", error);
            set({ error: error?.message ?? "Failed to initialize wallet" });
        } finally {
            set({ isLoading: false });
        }
    },

    login: async () => {
        set({ isLoading: true });
        try {
            await get().createLink(false);
        } finally {
            set({ isLoading: false });
        }
    },

    // Restore previous session (same browser)
    reconnect: async () => {
        set({ isLoading: true });
        try {
            // optional localStorage hint, but SDK restore is what matters
            if (typeof window !== "undefined") {
                // even if there is no marker, try restore — SDK will no-op if none exists
            }
            await get().createLink(false);
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        const { link, session } = get();
        try {
            if (link && session) {
                await link.removeSession(REQUEST_ACCOUNT, session.auth, CHAIN_ID);
            }
        } catch (e) {
            console.error("removeSession error:", e);
        } finally {
            // clear local state
            set({ session: undefined, user: undefined, link: undefined });
            // clear user store too
            useUserStore.getState().setActor("");
            useUserStore.getState().setPermission("");
            useUserStore.getState().setAccountData(undefined);
            // best-effort remove marker
            try { if (typeof window !== "undefined") localStorage.removeItem("proton_session"); } catch { }
        }
    },

    transfer: async (to, amount) => {
        const { session } = get();
        if (!session) throw new Error("No active session");

        await session.transact(
            {
                actions: [
                    {
                        account: "achu",
                        name: "achuswap",
                        authorization: [session.auth],
                        data: {
                            from: session.auth.actor,
                            to,
                            quantity: `${(+amount).toFixed(4)} XPR`,
                            memo: "",
                        },
                    },
                ],
            },
            { broadcast: true }
        );
    },

    fetchUser: async (account) => {
        try {
            const acc = account.startsWith("@") ? account.slice(1) : account;

            const result = await rpc.get_table_rows({
                code: "eosio.proton",
                scope: "eosio.proton",
                table: "usersinfo",
                key_type: "i64",
                lower_bound: acc,
                index_position: 1,
                limit: 1,
                json: true,
            });

            if (result.rows.length > 0 && result.rows[0].acc === acc) {
                const user = result.rows[0] as RpcInterfaces.UserInfo;
                set({ user }); // keep for your UI
                useUserStore.getState().setAccountData(user);
            } else {
                set({ user: undefined });
                useUserStore.getState().setAccountData(undefined);
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
            set({ user: undefined });
            useUserStore.getState().setAccountData(undefined);
        }
    },
}));
