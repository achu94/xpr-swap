import Image from "next/image";
import { useUserStore } from "../store/userStore"; // adjust the path as needed
import * as SDK from "../webSdk";

export const Avatar = () => {
  // Get state and actions from the Zustand store
  const actor = useUserStore((state) => state.actor);
  const setActor = useUserStore((state) => state.setActor);
  const setPermission = useUserStore((state) => state.setPermission);
  const setAccountData = useUserStore((state) => state.setAccountData);
  const getUserAvatar = useUserStore((state) => state.getUserAvatar);

  // Clear the user state
  const clear = () => {
    setActor("");
    setPermission("");
    setAccountData(undefined);
  };

  // Login function
  const login = async (reconnect: boolean = false) => {
    clear();

    if (reconnect) {
      await SDK.reconnect();
    } else {
      await SDK.login();
    }

    if (SDK.session && SDK.session.auth) {
      const avatarBase64 = await SDK.getProtonAvatar(
        SDK.session.auth.actor.toString()
      );

      setActor(SDK.session.auth.actor.toString());
      setPermission(SDK.session.auth.permission.toString());
      setAccountData(avatarBase64);
    }
  };

  // Logout function
  const logout = async () => {
    await SDK.logout();
    clear();
  };

  // If no actor is present, show the login button
  if (!actor) {
    return (
      <div
        onClick={() => login()}
        className="cursor-pointer whitespace-nowrap bg-purple-100 border border-transparent rounded-md py-2 px-4 inline-flex items-center justify-center text-base font-medium text-purple-600 hover:bg-purple-200"
      >
        Login
      </div>
    );
  }

  // Compute the avatar URL using the store's getter
  const avatar = getUserAvatar();

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        {/* Profile Image */}
        <div
          className="bg-gray-600 rounded-full flex items-center p-2 cursor-pointer hover:bg-gray-500 transition"
          id="user-menu"
          aria-haspopup="true"
        >
          <Image
            className="rounded-full border-2 border-purple-600"
            src={avatar.trim()}
            width={40}
            height={40}
            alt="Profile"
          />
        </div>

        {/* User Name & Logout Button */}
        <div className="flex items-center bg-gray-700 text-white px-4 py-2 rounded-full shadow-md gap-2">
          <span className="text-sm font-medium">{actor}</span>

          {/* Logout Icon */}
          <svg
            aria-hidden="true"
            focusable="false"
            data-prefix="far"
            data-icon="trash-alt"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            onClick={logout}
            className="w-5 h-5 text-red-400 hover:text-red-500 transition cursor-pointer"
            aria-label="Logout"
          >
            <path
              fill="currentColor"
              d="M268 416h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41 0H173.59a48 48 0 0 0-41.16 23.3L98.41 80H16A16 16 0 0 0 0 96v16a16 16 0 0 0 16 16h16v336a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128h16a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16zM171.84 50.91A6 6 0 0 1 177 48h94a6 6 0 0 1 5.15 2.91L293.61 80H154.39zM368 464H80V128h288zm-212-48h24a12 12 0 0 0 12-12V188a12 12 0 0 0-12-12h-24a12 12 0 0 0-12 12v216a12 12 0 0 0 12 12z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
