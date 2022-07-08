require('@nomiclabs/hardhat-waffle')
const dotenv = require('dotenv')
dotenv.config()

/**
 * Config sets the gateways to the proper node provider on Goerli & Polygon Mumbai testnets & loads the private key from `.env`
 */
module.exports = {
	solidity: '0.8.4',
	hardhat: {},
	networks: {
		'ethereum-goerli': {
			url: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_ETH_GOERLI_API_KEY}`,
			accounts: [`${process.env.PRIVATE_KEY}`],
		},
		'polygon-mumbai': {
			url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_POLYGON_MUMBAI_API_KEY}`,
			accounts: [`${process.env.PRIVATE_KEY}`],
		},
	},
}
