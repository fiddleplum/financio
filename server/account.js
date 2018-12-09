const Transaction = require('./transaction');

class Account {
	constructor() {
		this.name = '';
		this.type = '';

		/**
		 * @type {Map<string, Transaction>}
		 */
		this.transactions = new Map();
	}
}

module.exports = Account;
