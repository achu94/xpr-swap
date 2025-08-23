// protonClient.ts
import ProtonWebSDK, {
  ProtonWebLink,
  LinkSession,
  TransactResult,
  Link,
} from '@proton/web-sdk';
import { Serialize, JsonRpc, RpcInterfaces } from '@proton/js';

/**
 * ---------------------------------------------------------------------
 * CONFIG
 * ---------------------------------------------------------------------
 * Toggle TESTNET via env or hardcode it.
 * REQUEST_ACCOUNT must exist on the selected chain.
 * appName must stay identical across sessions for restore to work.
 */

// const IS_TESTNET =
//   typeof process !== 'undefined'
//     ? process.env.NEXT_PUBLIC_PROTON_TESTNET === 'true'
//     : true; // default to true for dev; set env to 'false' for mainnet

const IS_TESTNET = false;

// MAINNET
const MAINNET_CHAIN_ID =
  '384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0';
const MAINNET_ENDPOINTS = ['https://proton.greymass.com'];

// TESTNET
const TESTNET_CHAIN_ID =
  '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd';
const TESTNET_ENDPOINTS = [
  'https://tn1.protonnz.com',
  'https://proton-testnet.edenia.cloud',
  'https://proton-testnet.genereos.io',
  'https://proton-public-testnet.neftyblocks.com',
];

const APP_NAME = 'taskly';
const REQUEST_ACCOUNT = 'taskly'; // ensure this exists on your chosen chain

const CHAIN_ID = IS_TESTNET ? TESTNET_CHAIN_ID : MAINNET_CHAIN_ID;
const ENDPOINTS = IS_TESTNET ? TESTNET_ENDPOINTS : MAINNET_ENDPOINTS;

/**
 * eosjs JsonRpc expects a single endpoint (string), not an array.
 * We'll start with the first and you can implement your own rotation if needed.
 */
function makeRpc(): JsonRpc {
  return new JsonRpc(ENDPOINTS[0]);
}

export const rpc = makeRpc();

export let link: ProtonWebLink | Link | undefined;
export let session: LinkSession | undefined;

/**
 * ---------------------------------------------------------------------
 * LINK / SESSION
 * ---------------------------------------------------------------------
 */

type CreateLinkOpts = { restoreSession?: boolean };

export const createLink = async (opts: CreateLinkOpts = {}): Promise<void> => {
  const { restoreSession = false } = opts;

  // Avoid SSR issues (Next.js). Only run in browser.
  if (typeof window === 'undefined') return;

  try {
    const result = await ProtonWebSDK({
      linkOptions: {
        endpoints: ENDPOINTS, // array is fine for ProtonWebSDK
        chainId: CHAIN_ID,
        restoreSession,
      },
      transportOptions: {
        requestAccount: REQUEST_ACCOUNT,
        requestStatus: false,
      },
      selectorOptions: {
        appName: APP_NAME, // keep identical for session restore
      },
    });

    console.log(result)

    link = result.link;
    session = result.session;
  } catch (err) {
    console.error('createLink error', err);
    // If restore failed, try a fresh session once
    if (restoreSession) {
      await createLink({ restoreSession: false });
    }
  }
};

export const login = async (): Promise<LinkSession | undefined> => {
  if (typeof window === 'undefined') return;
  await createLink({ restoreSession: false });
  return session;
};

export const reconnect = async (): Promise<LinkSession | undefined> => {
  if (!session) {
    await createLink({ restoreSession: true }); // try restore first
  }
  return session;
};

export const logout = async (): Promise<void> => {
  if (link && session) {
    try {
      await link.removeSession(REQUEST_ACCOUNT, session.auth, CHAIN_ID);
    } catch (e) {
      console.error('removeSession error', e);
    }
  }
  session = undefined;
  link = undefined;
};

/**
 * ---------------------------------------------------------------------
 * TRANSACT HELPERS
 * ---------------------------------------------------------------------
 */

export const transact = async (
  actions: Serialize.Action[],
  broadcast: boolean
): Promise<TransactResult> => {
  if (!session) throw new Error('No Session');
  return session.transact(
    { transaction: { actions } as never },
    { broadcast }
  );
};

export const transfer = async ({
  to,
  amount,
  memo = '',
}: {
  to: string;
  amount: string; // "1.23" etc.
  memo?: string;
}) => {
  if (!session) throw new Error('No Session');

  const quantity = `${(+amount).toFixed(4)} XPR`; // 4 decimals for XPR

  return session.transact(
    {
      actions: [
        {
          account: 'eosio.token',
          name: 'transfer',
          data: {
            from: session.auth.actor,
            to,
            quantity,
            memo,
          },
          authorization: [session.auth],
        },
      ],
    },
    { broadcast: true }
  );
};

/**
 * ---------------------------------------------------------------------
 * READ HELPERS
 * ---------------------------------------------------------------------
 */

export async function getProtonAvatar(
  account: string
): Promise<RpcInterfaces.UserInfo | undefined> {
  try {
    const res = await rpc.get_table_rows({
      code: 'eosio.proton',
      scope: 'eosio.proton',
      table: 'usersinfo',
      key_type: 'i64',
      lower_bound: account,
      index_position: 1,
      limit: 1,
      json: true,
    });

    if (res.rows?.length && res.rows[0].acc === account) {
      return res.rows[0] as RpcInterfaces.UserInfo;
    }
  } catch (e) {
    console.error('getProtonAvatar error', e);
  }
  return undefined;
}

/**
 * ---------------------------------------------------------------------
 * NOTES / TROUBLESHOOTING
 * ---------------------------------------------------------------------
 * - "restoreSession Error" is normal if there was no prior session saved
 *   (same appName + requestAccount + chainId + browser). This module falls
 *   back to a fresh session automatically.
 * - Run over HTTPS (or localhost) so WebAuthn/wallet flows work.
 * - If an endpoint is flaky, change ENDPOINTS[0] or implement rotation.
 * - REQUEST_ACCOUNT must be a valid account on the selected chain.
 */
