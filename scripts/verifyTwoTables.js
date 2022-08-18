// Standard `ethers` import for blockchain operations, plus `network` for logging the flagged network
const { ethers, network } = require("hardhat")
require("@nomiclabs/hardhat-etherscan")
const dotenv = require("dotenv")
dotenv.config()

async function main() {
	// Optionally, do the vefication as a separate script

	await hre.run("verify:verify", {
		address: "0x748Cd88277f0Ac7f42F266b4583A79CD30C4D070", // Deployed contract address -- potentially, use `hre` to help here
		constructorArguments: [
			"https://testnet.tableland.network/query?mode=list&s=",
			"table_nft_main_80001_926", // Name of the main table in the format {prefix}_{chainId}_{tableId}
			"table_nft_attributes_80001_927", // Name of the attributes table in the format {prefix}_{chainId}_{tableId}
		],
	})
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
