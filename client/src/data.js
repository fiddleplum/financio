/** @typedef {import('./ws').default} WS */

class Data {
	/**
	 * Sends to the websocket a 'list account' message, and returns the list of accounts.
	 * @returns {string[]}
	 */
	static async listAccounts() {
		/** @type string[]} */
		let accountNames = await window.app.ws.send({
			'command': 'list accounts'
		});
		return accountNames;
	}

	/**
	 * Sends to the websocket a 'create account' message.
	 * @param {string} name
	 * @param {string} type
	 */
	static async createAccount(name, type) {
		await window.app.ws.send({
			'command': 'create account',
			'name': name,
			'type': type
		});
	}

	/**
	 * Sends to the websocket a 'delete account' message.
	 * @param {string} name
	 */
	static async deleteAccount(name) {
		await window.app.ws.send({
			'command': 'delete account',
			'name': name
		});
	}

	/**
	 * Sends to the websock a 'view account' message.
	 */
	static async viewAccount(name) {
		const accountInfo = await window.app.ws.send({
			'command': 'view account',
			'name': name
		});
		return accountInfo;
	}

	/**
	 * Sents to the websocket a 'list transactions' message, and returns the list of transactions.
	 * @param {string} name
	 * @param {string} startDate
	 * @param {string} endDate
	 */
	static async listTransactions(name, startDate, endDate) {
		let transactions = await window.app.ws.send({
			'command': 'list transactions',
			'name': name,
			'startDate': startDate,
			'endDate': endDate
		});
		return transactions;
	}
}

export default Data;
