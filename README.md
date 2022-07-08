# NFT Minting Demo -- Metadata on IPFS

This project is the first in a series of many. It walks through the basics of how to deploy an NFT, starting with a bare bones setup. Deploy local metadata files to IPFS, push the NFT smart contract to Polygon Mumbai, and view it all on OpenSea.

# Overview

This project allows developers to take the a set of images, upload them to IPFS, and then write the corresponding output (CID) to metadata files (which originally have empty `image` fields). The only "admin" requirement is creating an account at Protocol Lab's [NFT.Storage](https://nft.storage/), which provides a suite of APIs to upload & pin files to IPFS (with gateway access, too). The project structure is as follows:

```
├── README.md
├── assets
│   ├── 0.jpeg
│   └── 1.jpeg
├── metadata
│   ├── 0
│   └── 1
├── contracts
│   └── TableNFT.sol
├── flattenedTableNFT.sol
├── hardhat.config.js
├── package-lock.json
├── package.json
├── scripts
│   ├── deploy.js
│   └── uploadMetadataToIpfs.js
└── test
│   └── test.js
└── .env
```

Namely, the project is broken into the following:

- `assets` => A couple of sample images, but any number can be included -- these will be uploaded to IPFS.
- `metadata` => The corresponding metadata files for each image, which lack the "image" field value. The metadata files will then be pushed to IPFS, but their "image" fields will first be overwritten by the image's `cid` upon IPFS upload. Must have a 1:1 relationship with matching names (e.g., `0.jpeg` for the image, and `0` for the JSON, omitting the extension).
- `contracts` => The NFT smart contract (`TableNFT`), which will mint tokens & allow for the `baseURI` to be set.
- `flattenedTableNFT.sol` => Although non-optimal, this demo leverages a "manual" process for verifying a smart contract on Polygon, which requires smart contract flattening (into a single file), some comments cleanup, and UI upload on [Polygonscan](https://polygonscan.com/). Optional step to do (or, can automate, instead).
- `hardhat.config.js` => Some useful deployment configs, including gateways to the proper node provider on Ethereum Goerli & Polygon Mumbai testnets -- and also loading the private key from `.env` for live testnet deployment.
- `scripts` => `uploadMetadataToIpfs` will look for images in `assets`, upload them to IPFS, write these CIDs to the corresponding `metadata` file, and upload the `metadata` directory to IPFS. Then, `deploy.js` will handle the smart contract deployment & set the `baseURI` to this `metadata` directory's CID, allowing `baseURI` and `tokenURI` to be called using this IPFS CID.
- `test` => includes some simple `chai` tests with `ethers` as well, including testing out the `tokenURI` is correct.
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
2. Create an API key & save it locally as `ALCHEMY_POLYGON_MUMBAI_API_KEY` and/or `ALCHEMY_ETH_GOERLI_API_KEY` in `.env`

## Example Output

The following details some of the deployed information on Polygon Mumbai:

- Contract address: `0x3537C0437792B326fa0747b4A95a8667873e916F`, verified & viewable on [Polygonscan](https://mumbai.polygonscan.com/address/0x3537C0437792B326fa0747b4A95a8667873e916F)
- Metadata directory on IPFS: [directory](https://bafybeiaq7buu37ubnl4uvxtibux3orf33la7tbcm3kv7jiuzaoet6u7que.ipfs.nftstorage.link/) and minted NFT's [metadata](https://bafybeiaq7buu37ubnl4uvxtibux3orf33la7tbcm3kv7jiuzaoet6u7que.ipfs.nftstorage.link/0) & image (also on IPFS)
- Listing on OpenSea (Polygon Mumbai testnet): [here](https://testnets.opensea.io/assets/mumbai/0x3537c0437792b326fa0747b4a95a8667873e916f/0)

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

```
npx hardhat node
npx hardhat run scripts/deploy.js --network hardhat
```

Or to deploy to live testnets like Ethereum Goerli:

```
npx hardhat run scripts/deploy.js --network ethereum-goerli
```

And/or Polygon Mumbai (note: OpenSea supports the Polygon testnet but does not have support for Ethereum Goerli):

```
npx hardhat run scripts/deploy.js --network polygon-mumbai
```
