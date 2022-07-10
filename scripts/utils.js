/**
 * Verifies if a transaction was incuded in a block using retry logic.
 * @param {Connection} tableland A connection object to Tableland & the chain.
 * @param {string} txnHash The on-chain transaction hash.
 * @returns {boolean} A boolean representing whether or not the tx was confirmed.
 */
async function waitForTx(tableland, txnHash) {
	// Try to get the receipt from the tx hash
	// The value is 'undefined' while the create table tx is in flux
	let table = await tableland.receipt(txnHash)
	let tries = 0
	// Set some Promise & timeout to allow for retry logic until 'table' exists
	while (!table && tries < 5) {
		await new Promise((resolve) => setTimeout(resolve, 1500 + tries * 500))
		table = await tableland.receipt(txnHash)
		tries++
	}
	// Return a boolean to represent the tx confirmation status after the retry logic has passed
	return !table ? false : true
}

module.exports = waitForTx
