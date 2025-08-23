import { Select } from "@headlessui/react";

const ChooseNetwork = () => {
    return (
        <Select className="bg-transparent text-2xl" name="network" aria-label="Choose Netowrk" data-focus data-hover>
            <option  value="paused">Mainnet</option>
            <option disabled value="active">Testnet</option>
        </Select>
    )
}

export default ChooseNetwork;