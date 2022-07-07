# Simple NFT Minting Demo

This project is the first in a series of many. It walks through the basics of how to deploy an NFT, starting with a bare bones setup.

# Overview

This project allows developers to take the a set of images, upload them to IPFS, and then write the corresponding output (CID) to metadata files (which originally have empty `image` fields). The only admin dependency is creating an account at Protocol Lab's (NFT.Storage)[https://nft.storage/], which provides a suite of APIs to upload & pin files to IPFS. The project hierarchy is as follows:

```
.
├── assets
│   ├── 0.jpeg
│   └── 1.jpeg
├── contracts
│   └── TableNFT.sol
├── hardhat.config.js
├── metadata
│   ├── 0
│   └── 1
├── package-lock.json
├── package.json
├── scripts
│   ├── deploy.js
│   └── uploadMetadataToIpfs.js
└── test
    └── testMint.js
```

Namely, the project is broken into the following:

- `assets` => A couple of sample images, but any number can be uploaded -- these will be uploaded to IPFS.
- `contracts` => The NFT smart contract (`TableNFT`), which will mint tokens & allow for the `baseURI` to be set
- `metadata` => The corresponding metadata files for each image, which lack the "image" field value. The metadata files will then be pushed to IPFS, but their "image" fields will first be overwritten by the image's `cid` upon IPFS upload.
- `scripts` => `uploadMetadataToIpfs` will look for images in `assets`, upload them to IPFS, write these CIDs to the corresponding `metadata` file, and upload the `metadata` directory to IPFS. Then, `deploy.js` will handle the smart contract deployment & set the `baseURI` to this `metadata` directory's CID, allowing `baseURI` and `tokenURI` to be called using this IPFS CID.

## Setup

1. Clone this repo: `git clone https://github.com/dtbuchholz/table-nft`
2. Create an nft.storage account: (here)[https://nft.storage/login/]
3. Create an API key & save it locally as `NFT_STORAGE_KEY` in a `.env` file: (here)[https://nft.storage/manage/]
4. Run any of the scripts defined below

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
node scripts/deploy.js
```
