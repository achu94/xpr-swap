import { create } from "zustand";
import ProtonWebSDK, { LinkSession, ProtonWebLink, Link } from "@proton/web-sdk";
import { JsonRpc, RpcInterfaces} from "@proton/js";

const REQUEST_ACCOUNT = "achubestbp";

// // MAINNET
// const CHAIN_ID = '384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0'
// const ENDPOINTS = ['https://proton.greymass.com']

// TESTNET CONFIG
const CHAIN_ID = "71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd";
const ENDPOINTS = ["https://protontestnet.ledgerwise.io/"];
const rpc = new JsonRpc(ENDPOINTS);

interface WalletState {
    link?: ProtonWebLink | Link;
    session?: LinkSession;
    user?: RpcInterfaces.UserInfo;
    isLoading: boolean;
    error: string | null;
    rpc: JsonRpc;

    createLink: (restoreSession?: boolean) => Promise<void>;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    reconnect: () => Promise<void>;
    transfer: (to: string, amount: string) => Promise<void>;
    fetchUser: (account: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
    link: undefined,
    session: undefined,
    user: undefined,
    isLoading: false,
    error: null,
    rpc: rpc,

    createLink: async (restoreSession = false) => {
        set({ isLoading: true, error: null });

        try {
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

            if (session) {
                // ✅ Save session to localStorage
                localStorage.setItem("proton_session", JSON.stringify(session));
            }

            set({ link, session });
        } catch (error) {
            console.error("Error initializing link:", error);
            set({ error: "Failed to initialize wallet", isLoading: false });
        }
    },

    login: async () => {
        set({ isLoading: true });

        await get().createLink(false);
        const { session } = get();

        if (session) {
            await get().fetchUser(session.auth.actor.toString());
        }

        set({ isLoading: false });
    },

    // ✅ Restore session on page refresh
    reconnect: async () => {
        set({ isLoading: true });

        // Retrieve stored session from localStorage
        const storedSession = localStorage.getItem("proton_session");

        if (storedSession) {
            try {
                // Restore session using ProtonWebSDK
                const { link, session } = await ProtonWebSDK({
                    linkOptions: {
                        endpoints: ENDPOINTS,
                        chainId: CHAIN_ID,
                        restoreSession: true,
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

                if (session) {
                    await get().fetchUser(session.auth.actor.toString());
                }
            } catch (error) {
                console.error("Error restoring session:", error);
                localStorage.removeItem("proton_session"); // Clear invalid session
            }
        }

        set({ isLoading: false });
    },

    logout: async () => {
        const { link, session } = get();
        if (link && session) {
            await link.removeSession(REQUEST_ACCOUNT, session.auth, CHAIN_ID);
        }

        // ✅ Remove session from localStorage
        localStorage.removeItem("proton_session");

        set({ session: undefined, user: undefined, link: undefined });
    },

    transfer: async (to, amount) => {
        const { session } = get();
        if (!session) throw new Error("No active session");

        await session.transact(
            {
                actions: [
                    {
                        account: "eosio.token",
                        name: "transfer",
                        data: {
                            from: session.auth.actor,
                            to,
                            quantity: `${(+amount).toFixed(4)} XPR`,
                            memo: "",
                        },
                        authorization: [session.auth],
                    },
                ],
            },
            { broadcast: true }
        );
    },

    fetchUser: async (account) => {
        try {
            const result = await rpc.get_table_rows({
                code: "eosio.proton",
                scope: "eosio.proton",
                table: "usersinfo",
                key_type: "i64",
                lower_bound: account,
                index_position: 1,
                limit: 1,
            });

            if (result.rows.length > 0 && result.rows[0].acc === account) {
                set({ user: result.rows[0] });
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    },
}));