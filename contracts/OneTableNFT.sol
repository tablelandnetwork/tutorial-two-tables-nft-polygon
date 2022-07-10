// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

/**
 * @dev A simple NFT using Tableland to host metadata in a single table
 */
contract OneTableNFT is ERC721 {
	// A URI used to reference off-chain metadata.
	string public baseURIString;
	// The name of the metadata table in Tableland
	// Schema: id int, name text, description text, image text, attributes text
	string public tableName;
	// A token counter, to track NFT tokenIds.
	uint256 private _tokenIds;

	/**
	 * @dev Initialize TableNFT
	 * @param baseURI Set the contract's base URI to the Tableland gateway.
	 * @param _tableName The table's `name`, setting to storage variable `tableName`.
	 */
	constructor(string memory baseURI, string memory _tableName) ERC721('OneTableNFT', 'OTNFT') {
		// Initialize with token counter at zero.
		_tokenIds = 0;
		// Set the base URI
		baseURIString = baseURI;
		// Set the table name
		tableName = _tableName;
	}

	/**
	 *  @dev Must override the default implementation, which returns an empty string.
	 */
	function _baseURI() internal view override returns (string memory) {
		return baseURIString;
	}

	/**
	 *  @dev Must override the default implementation, which simply appends a tokenId to _baseURI.
	 *  @param tokenId The id of the NFT token that is being requested.
	 */
	function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
		require(_exists(tokenId), 'ERC721Metadata: URI query for nonexistent token');
		string memory baseURI = _baseURI();

		if (bytes(baseURI).length == 0) {
			return '';
		}

		/**
            A SQL query for a single table row at the `tokenId`.

            SELECT json_object('id',id,'name',name,'description',description,'attributes',attributes)
            FROM {tableName} 
            WHERE id =
         */
		string memory query = string(
			abi.encodePacked(
				'select%20',
				'json_object%28%27id%27%2Cid%2C%27name%27%2Cname%2C%27description%27%2Cdescription%2C%27attributes%27%2Cattributes%29%20',
				'from%20',
				tableName,
				'%20where%20id%20%3D'
			)
		);
		// Return the baseURI with an appended query string, which looks up the token id in a row.
		// `&mode=list` formats into the proper JSON object expected by metadata standards.
		return
			string(
				abi.encodePacked(
					baseURI,
					query,
					Strings.toString(tokenId),
					// &mode=list
					'%26mode%3Dlist'
				)
			);
	}

	/**
	 * @dev Mint an NFT, incrementing the `_tokenIds` upon each call
	 */
	function mint() public {
		_safeMint(msg.sender, _tokenIds);
		_tokenIds++;
	}
}
