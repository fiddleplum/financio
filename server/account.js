import Transaction from './transaction';

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

export default Account;
