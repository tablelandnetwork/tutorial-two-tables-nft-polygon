// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TableNFT is ERC721 {
    // A URI used to reference off-chain metadata
    string public baseURIString;
    // A token counter, to track NFT `tokenId`
    uint256 public tokenId;

    /**
        @dev Initialize TableNFT
        @param baseURI Set the contract's base URI to the IPFS directory CID
     */
    constructor(string memory baseURI) ERC721("TableNFT", "TNFT") {
        // Initialize with token counter at zero
        tokenId = 0;
        // Set the base URI
        baseURIString = baseURI;
    }

    /**
        @dev Must override the default implementation, which returns an empty string
     */
    function _baseURI() internal view override returns (string memory) {
        return baseURIString;
    }

    /** 
        @dev Mint an NFT, incrementing the `tokenId` upon each call
     */
    function mint() public {
        _safeMint(msg.sender, tokenId);
        tokenId++;
    }
}
