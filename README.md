# NFT Minting Demo -- Metadata on IPFS

This tutorial shows developers how to use Tablelanad for NFT metadata in a two table deployment model.

## Overview

The goal of this project is to take some metadata files hosted locally (in `assets` and `images`) and walk through how to take the a set of images, upload them to IPFS, and combine them with local metadata JSON files (which originally have empty `image` fields). The metadata is parsed into SQL statements, which are used in a `hardhat` deployment of a `TwoTablesNFT` smart contract.

```
├── README.md
├── images
│   ├── 0.jpeg
│   └── 1.jpeg
├── contracts
│   └── TwoTablesNFT.sol
├── hardhat.config.js
├── metadata
│   ├── 0
│   └── 1
├── package-lock.json
├── package.json
├── scripts
│   ├── deployTwoTables.js
│   ├── prepareSql.js
│   ├── metadataProcessing.js
│   └── verifyTwoTables.js
└── test
│   └── test.js
└── .env
```

Namely, the project is broken into the following:

- `images` => A couple of sample images, but any images/amount can be included -- these will be uploaded to IPFS. Note that this will be the hardcoded and related to the NFT tokenId.
- `metadata` => The corresponding metadata files for each image, which lack the "image" field value (empty string by default). The metadata files will have their "image" fields overwritten by the image's `CID` upon IPFS upload. Must have a 1:1 relationship with matching names (e.g., `0.jpeg` for the image, and `0` for the JSON, omitting the extension).
- `contracts` => The NFT smart contract (`TwoTablesNFT`), which will mint tokens & allow for the `baseURI` to be set that points to the Tableland network. `TwoTablesNFT` is the "recommended" way to do things.
- `hardhat.config.js` => Some useful deployment configs, including gateways to the proper Alchemy node provider on Polygon Mumbai testnets -- and also loading the private key from `.env` for live testnet deployment.
- `scripts`:
  - `metadataProcessing.js` => Look for images in `images`, upload images to IPFS, parse the `metadata` files, write these CIDs to the corresponding JSON/object, and also, return the built object for metadata preparation.
  - `prepareSql.js` => Take the output from `uploadMetadataToIpfs.js` and build SQL statements.
  - `deployTwoTables.js` => Deploy the `TwoTablesNFT` contracts, using the output from `prepareSql.js` -- and set the `baseURI` & `tokenURI` to the Tableland gateway (`testnet.tableland.network`).
  - `verifyTwoTables.js` => Although optional, an additional script that can be used to verify a contract on Polygonscan.
- `test` => Includes some simple `chai` tests with `ethers` as well, including testing out the `tokenURI` is correct.
- `.env` => Private variables to store locally, so _do not expose_ these publicly; examples are provided in `.env.example`

## Setup

1. Clone this repo:

   ```
   git clone https://github.com/dtbuchholz/table-nft
   ```

2. Create an nft.storage account: [here](https://nft.storage/login/)
3. Create an API key & save it locally as `NFT_STORAGE_API_KEY` in a `.env` file: [here](https://nft.storage/manage/)
4. Run any of the scripts defined below

Optionally, if you'd like to deploy to a live testnet, you'll also need to set up the following:

1. Sign up for an Alchemy account: [here](https://auth.alchemyapi.io/signup)
2. Create an API key & save it locally as `ALCHEMY_POLYGON_MUMBAI_API_KEY`

## Example Output

The following details some of the deployed information from this tutorial using Polygon Mumbai:

- Contract address: `0xeF9ee922f9dD3803228119d0f69f27aAe872F742`, verified & viewable on [Polygonscan](https://mumbai.polygonscan.com/address/0xeF9ee922f9dD3803228119d0f69f27aAe872F742)
- Metadata on Tableland: [here](https://testnet.tableland.network/query?mode=list&s=SELECT%20json_object%28%27id%27%2Cid%2C%27name%27%2Cname%2C%27description%27%2Cdescription%2C%27attributes%27%2Cjson_group_array%28json_object%28%27trait_type%27%2Ctrait_type%2C%27value%27%2Cvalue%29%29%29%20FROM%20table_nft_main_80001_934%20JOIN%20table_nft_attributes_80001_935%20ON%20table_nft_main_80001_934%2Eid%20%3D%20table_nft_attributes_80001_935%2Emain_id%20WHERE%20id%3D0%20group%20by%20id)
- Listing on OpenSea (Polygon Mumbai testnet): [here](https://testnets.opensea.io/collection/twotablesnft-gzrcczorea)

## Available Scripts

Compile the NFT smart contract

```
npx hardhat compile
```

Run hardhat tests, including validating the `tokenURI` works as expected

```
npx hardhat test
```

Deploy the smart contract locally, running the following in different shells. The `deploy.js` script uploads local files to IPFS and sets the CID to the NFT contract's `baseURI`.

Deploy to live testnets like Polygon Mumbai

```
npx hardhat run scripts/deploy.js --network polygon-mumbai
```

And Optionally, instead of verifying the contract in `deployTwoTables.js`, you can do:

```
npx hardhat run scripts/verifyTwoTables.js --network "polygon-mumbai"
```
