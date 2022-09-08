# Minting an NFT with Tableland + Polygon

This tutorial shows developers how to use Tableland for NFT metadata in a two table composable deployment model, using Polygon + SQL. For a full walkthrough, check out the writeup [here](https://docs.tableland.xyz/deploying-an-nft-on-polygon).

## Overview

The goal of this project is to show developers how to use Tableland + Polygon for metadata. There are a number of scripts that read some metadata files hosted locally (in `metadata` and `images`). It walks through how to take the set of images, upload them to IPFS, and combine them with local metadata JSON files (which originally have empty `image` fields) into ERC721 compliant objects. Then, the metadata is parsed into SQL statements for Tableland usage, which are used in a `hardhat` deployment of a `TwoTablesNFT` smart contract. Polygon is used for deploying the tables and the NFT smart contract.

```text
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

- `images` => A couple of sample images, but any images/amount can be included -- these will be uploaded to IPFS. Note that these will be related to the NFT's `tokenId`.
- `metadata` => The corresponding metadata files for each image, which lack the "image" field value (empty string by default). The metadata files will have their "image" values overwritten by the image's `CID` upon IPFS upload. These JSON files must have a 1:1 relationship to images, with matching names (e.g., `0.jpeg` for the image, and `0` for the JSON, omitting the extension).
- `contracts` => The NFT smart contract (`TwoTablesNFT`), which will mint tokens & allow for the `baseURI` to be set that points to the Tableland network. `TwoTablesNFT` is the "recommended" way to do things where two Tableland tables (_main_ and _attributes_) are used and composed with SQL.
- `hardhat.config.js` => Some useful deployment configs, including gateways to the proper Alchemy node provider on Polygon Mumbai testnets -- and also loading the private key from `.env` for live testnet deployment.
- `scripts`:
  - `metadataProcessing.js` => Look for images in `images`, upload images to IPFS, parse the `metadata` files, write these CIDs to the corresponding JSON/object, and also, return the built object for metadata preparation.
  - `prepareSql.js` => Take the output from `uploadMetadataToIpfs.js` and build SQL statements.
  - `deployTwoTables.js` => Deploy the `TwoTablesNFT` contracts, using the output from `prepareSql.js` -- and set the `baseURI` & `tokenURI` to the Tableland gateway (`testnet.tableland.network`).
  - `verifyTwoTables.js` => Although optional, an additional script that can be used to verify a contract on Polygonscan.
- `test` => Includes some simple `chai` tests with `ethers` as well, including testing out the `tokenURI` is correct.
- `.env` => Private variables to store locally, so _do not expose_ these publicly; examples are provided in `.env.example`

## Setup

1. Clone this repo to use the `images` and `metadata` files (and to view the final code).
2. Export your private key and save it in a `.env` file as `PRIVATE_KEY`. Steps 3-5 will do something similar.
3. Create an nft.storage account ([here](https://nft.storage/login/)), an API key ([here](https://nft.storage/manage/)), and save it locally as `NFT_STORAGE_API_KEY`.
4. Sign up for an Alchemy account ([here](https://auth.alchemyapi.io/signup)) and save it as `ALCHEMY_POLYGON_MUMBAI_API_KEY`.
5. Optionally, sign up for a Polygonscan account and save an API key as `POLYGONSCAN_API_KEY`.
6. Run any of the scripts defined below, such as deploying to Polygon: `npx hardhat run scripts/deploy.js --network polygon-mumbai`

## Example Output

The following details some of the deployed information from this tutorial using Polygon Mumbai:

- Contract address: `0xDAa7F50C50018D7332da819be275693cA9604178`, verified & viewable on [Polygonscan](https://mumbai.polygonscan.com/address/0xDAa7F50C50018D7332da819be275693cA9604178)
- Main table creation transaction: [0x2016f295221c235f62d89b44f8d6a51096a58c0a2722e93f2c2133e5471d0737](https://mumbai.polygonscan.com/tx/0x2016f295221c235f62d89b44f8d6a51096a58c0a2722e93f2c2133e5471d0737)
- Attributes table creation transaction: [0x9f8e874bec740dc1299fe0357a9b093f1938272311948437072de8a2b91c5f04](https://mumbai.polygonscan.com/tx/0x9f8e874bec740dc1299fe0357a9b093f1938272311948437072de8a2b91c5f04)
- NFT metadata on Tableland: [here](https://testnet.tableland.network/query?mode=list&s=SELECT%20json_object%28%27id%27%2Cid%2C%27name%27%2Cname%2C%27description%27%2Cdescription%2C%27image%27%2Cimage%2C%27attributes%27%2Cjson_group_array%28json_object%28%27trait_type%27%2Ctrait_type%2C%27value%27%2Cvalue%29%29%29%20FROM%20table_nft_main_80001_1510%20JOIN%20table_nft_attributes_80001_1511%20ON%20table_nft_main_80001_1510%2Eid%20%3D%20table_nft_attributes_80001_1511%2Emain_id%20WHERE%20id%3D0%20group%20by%20id)
- Listing on OpenSea (Polygon Mumbai testnet): [here](https://testnets.opensea.io/collection/twotablesnft)

## Available Scripts

Compile the NFT smart contract

```console
npx hardhat compile
```

Run hardhat tests, including validating the `tokenURI` works as expected

```console
npx hardhat test
```

Deploy the smart contract locally, running the following in different shells. The `deploy.js` script uploads local files to IPFS and sets the CID to the NFT contract's `baseURI`.

Deploy to live testnets like Polygon Mumbai

```console
npx hardhat run scripts/deploy.js --network polygon-mumbai
```

And Optionally, instead of verifying the contract in `deployTwoTables.js`, you can do:

```console
npx hardhat run scripts/verifyTwoTables.js --network polygon-mumbai
```
