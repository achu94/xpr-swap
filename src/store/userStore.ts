import { create } from 'zustand';
import { RpcInterfaces } from '@proton/js';

interface UserStore {
  actor: string;
  permission: string;
  accountData?: RpcInterfaces.UserInfo;
  setActor: (actor: string) => void;
  setPermission: (permission: string) => void;
  setAccountData: (accountData?: RpcInterfaces.UserInfo) => void;
  setAuth: (actor: string, permission: string) => void;
  getUserAvatar: () => string;
}

export const useUserStore = create<UserStore>((set, get) => ({
  actor: '',
  permission: '',
  accountData: undefined,
  setActor: (actor) => set({ actor }),
  setPermission: (permission) => set({ permission }),
  setAccountData: (accountData) => set({ accountData }),
  setAuth: (actor, permission) => set({ actor, permission }),
  getUserAvatar: () => {
    const { accountData } = get();
    const avatar = accountData?.avatar;
    if (avatar) {
      if (avatar.indexOf('/9j/') !== -1) return `data:image/jpeg;base64,${avatar}`;
      if (avatar.indexOf('iVBORw0KGgo') !== -1) return `data:image/png;base64,${avatar}`;
    }
    return 'proton_avatar.png';
  },
}));
