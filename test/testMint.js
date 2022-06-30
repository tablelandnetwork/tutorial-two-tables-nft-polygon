const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('TableNFT', function () {
	it('Should return an initialized `tokenCounter` of `0`', async function () {
		const [owner, addr1] = await ethers.getSigners()

		const TableNFT = await ethers.getContractFactory('TableNFT')
		const tableNFT = await TableNFT.deploy()
		await tableNFT.deployed()

		// Mint an NFT to the calling `owner` & wait until the transaction is mined
		const mintTx = await tableNFT.connect(owner).mint()
		await mintTx.wait()

		// Validate the `tokenCounter` was incremented
		const tokenCounter = await tableNFT.tokenCounter()
		expect(tokenCounter.toNumber()).to.equal(1)
	})
	it('Should mint a token to the caller address', async function () {
		const [owner, addr1] = await ethers.getSigners()

		const TableNFT = await ethers.getContractFactory('TableNFT')
		const tableNFT = await TableNFT.deploy()
		await tableNFT.deployed()

		// Mint an NFT to the calling `owner` & wait until the transaction is mined
		const mintTx = await tableNFT.connect(owner).mint()
		await mintTx.wait()

		// Validate the owner of the minted token is `owner`
		expect(await tableNFT.ownerOf(0)).to.equal(owner.address)
	})
	it('Should allow transfers from token `owner` to others', async function () {
		const [owner, addr1] = await ethers.getSigners()

		const TableNFT = await ethers.getContractFactory('TableNFT')
		const tableNFT = await TableNFT.deploy()
		await tableNFT.deployed()

		// Mint an NFT to the calling `owner` & wait until the transaction is mined
		const mintTx = await tableNFT.connect(owner).mint()
		await mintTx.wait()

		// Validate the NFT can be transferred
		await tableNFT['safeTransferFrom(address,address,uint256)'](owner.address, addr1.address, 0)
		expect(await tableNFT.ownerOf(0)).to.equal(addr1.address)
	})
})
