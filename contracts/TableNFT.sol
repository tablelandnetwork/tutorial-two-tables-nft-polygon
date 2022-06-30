// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TableNFT is ERC721 {
    uint256 public tokenCounter;

    constructor() ERC721("TableNFT", "TNFT") {
        tokenCounter = 0;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "{TODO_ipfs_gateway_to_directory_cid}";
    }

    function mint() public {
        _safeMint(msg.sender, tokenCounter);
        tokenCounter++;
    }
}
