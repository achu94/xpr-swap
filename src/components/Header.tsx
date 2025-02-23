// import { Avatar } from "./Avatar";
import logo from "../assets/logo.svg";
import Image from "next/image";
import { Wallet } from "./Profil/Wallet";
import ChooseNetwork from "./ChooseNetwork";

export const Header = () => (
  <div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex justify-between items-center border-b border-gray-200 py-6 md:justify-start md:space-x-10">
        <div className="sm:block flex justify-start">
          <span className="sr-only">Proton</span>
          <Image className="w-auto h-8 sm:h-10" src={logo} alt="XPR Network" />
        </div>
        <ChooseNetwork />
        <div className="flex items-center justify-end space-x-8 md:flex-1 lg:w-0">
          <Wallet />
        </div>
      </div>
    </div>
  </div>
);
