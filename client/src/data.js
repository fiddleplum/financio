/** @typedef {import('./ws').default} WS */

class Data {
	/**
	 * Sends to the websocket a 'list account' message, and returns the list of accounts.
	 * @param {WS} ws
	 * @returns {string[]}
	 */
	static async listAccounts(ws) {
		/** @type string[]} */
		let accountNames = await ws.send({
			'command': 'list accounts'
		});
		return accountNames;
	}

	/**
	 * Sends to the websocket a 'create account' message.
	 * @param {WS} ws
	 * @param {string} name
	 * @param {string} type
	 */
	static async createAccount(ws, name, type) {
		await ws.send({
			'command': 'create account',
			'name': name,
			'type': type
		});
	}

	/**
	 * Sends to the websocket a 'delete account' message.
	 * @param {WS} ws
	 * @param {string} name
	 */
	static async deleteAccount(ws, name) {
		await ws.send({
			'command': 'delete account',
			'name': name
		});
	}

	static async viewAccount(ws, name) {
		const accountInfo = await ws.send({
			'command': 'view account',
			'name': name
		});
		return accountInfo;
	}

	/**
	 * Sents to the websocket a 'list transactions' message, and returns the list of transactions.
	 * @param {WS} ws
	 * @param {string} name
	 * @param {string} startDate
	 * @param {string} endDate
	 */
	static async listTransactions(ws, name, startDate, endDate) {
		let transactions = await ws.send({
			'command': 'list transactions',
			'name': name,
			'startDate': startDate,
			'endDate': endDate
		});
		return transactions;
	}
}

export default Data;
