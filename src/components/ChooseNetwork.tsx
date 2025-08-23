import { Select } from "@headlessui/react";

const ChooseNetwork = () => {
    return (
        <Select className="bg-transparent text-2xl" name="network" aria-label="Choose Netowrk" data-focus data-hover>
            <option  disabled value="paused">Mainnet</option>
            <option value="active">Testnet</option>
        </Select>
    )
}

export default ChooseNetwork;