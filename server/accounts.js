const fs = require('fs');
/** @typedef {import('../src/transaction').default} Transaction */

class Accounts {
	static initialize() {
		if (!fs.existsSync('data/accounts/')) {
			fs.mkdirSync('data/accounts/');
		}
	}

	static list() {
		let accounts = [];
		let files = fs.readdirSync('data/accounts/');
		for (let i = 0, l = files.length; i < l; i++) {
			if (files[i].endsWith('.json')) {
				accounts.push(files[i].substr(0, files[i].length - 5));
			}
		}
		return accounts;
	}

	static create(name, type) {
		// Validate the name.
		if (!this._validateName(name)) {
			throw new Error('Error: The name "' + name + '" is not a valid account name. Please use only alphanumeric, space, underscore, and dash characters.');
		}

		// Verify that the name doesn't already exist.
		if (fs.existsSync('data/accounts/' + name + '.json')) {
			throw new Error('The name "' + name + '" already exists.');
		}

		// Create the account JSON.
		const account = {
			name: name,
			type: type
		};

		// Create the .json file.
		try {
			fs.writeFileSync('data/accounts/' + name + '.json', JSON.stringify(account));
		}
		catch (error) {
			throw new Error('Error: The file "data/accounts/' + name + '.json" could not be written to. ' + error);
		}

		// Create the data folder.
		try {
			if (!fs.existsSync('data/accounts/' + name + '/')) {
				fs.mkdirSync('data/accounts/' + name + '/');
			}
		}
		catch (error) {
			throw new Error('Error: The folder "data/accounts/' + name + '/" could not be created. ' + error);
		}
	}

	static delete(name) {
		// Validate the name.
		if (!this._validateName(name)) {
			throw new Error('Error: The name "' + name + '" is not a valid account name. Please use only alphanumeric, space, underscore, and dash characters.');
		}

		// Verify that the name already exists.
		if (!fs.existsSync('data/accounts/' + name + '.json')) {
			throw new Error('The name "' + name + '" does not exist.');
		}

		// Delete all created folders and files for the account.
		fs.unlinkSync('data/accounts/' + name + '.json');
		if (fs.existsSync('data/accounts/' + name + '/')) {
			if (fs.existsSync('data/accounts/' + name + '/transactions/')) {
				let files = fs.readdirSync('data/accounts/' + name + '/transactions/');
				for (let i = 0, l = files.length; i < l; i++) {
					fs.unlinkSync('data/accounts/' + name + '/transactions/' + files[i]);
				}
				fs.rmdirSync('data/accounts/' + name + '/transactions/');
			}
			fs.rmdirSync('data/accounts/' + name + '/');
		}
	}

	static rename(name, newName) {
		// Validate the name.
		if (!this._validateName(name)) {
			throw new Error('The name "' + name + '" is not a valid account name. Please use only alphanumeric, space, underscore, and dash characters.');
		}

		// Validate the newName.
		if (!this._validateName(newName)) {
			throw new Error('The name "' + newName + '" is not a valid account name. Please use only alphanumeric, space, underscore, and dash characters.');
		}

		// Verify that the name already exists.
		if (!fs.existsSync('data/accounts/' + name + '.json')) {
			throw new Error('The name "' + name + '" does not exist.');
		}

		// Verify that the newName doesn't already exist.
		if (fs.existsSync('data/accounts/' + newName + '.json')) {
			throw new Error('The name "' + newName + '" already exists.');
		}

		// Rename the .json file.
		fs.renameSync('data/accounts/' + name + '.json', 'data/accounts/' + newName + '.json');

		// Rename the data folder.
		fs.renameSync('data/accounts/' + name + '/', 'data/accounts/' + newName + '/');
	}

	static view(name) {
		// Validate the name.
		if (!this._validateName(name)) {
			throw new Error('The name "' + name + '" is not a valid account name. Please use only alphanumeric, space, underscore, and dash characters.');
		}

		// Verify that the name exists.
		if (!fs.existsSync('data/accounts/' + name + '.json')) {
			throw new Error('Error: The account "' + name + '" does not exist.');
		}

		return JSON.parse(fs.readFileSync('data/accounts/' + name + '.json'));
	}

	/**
	 * Gets a list of the transactions.
	 * @param {string} name
	 * @param {string} startDate - ISO format
	 * @param {string} endDate - ISO format
	 * @returns {Transaction[]}
	 */
	static listTransactions(name, startDate, endDate) {
		// Validate the name.
		if (!this._validateName(name)) {
			throw new Error('The name "' + name + '" is not a valid account name. Please use only alphanumeric, space, underscore, and dash characters.');
		}

		/** @type {Transaction[]} */
		let transactions = [];
		if (fs.existsSync('data/accounts/' + name + '/transactions/')) {
			let date = new Date(startDate);
			const end = new Date(endDate);
			end.setUTCDate(end.getUTCDate() + 1); // Make it the next day to include the actual end date's transactions.
			while (date.getTime() < end.getTime()) {
				const filePath = this.getTransactionsFilePath(name, date);
				if (fs.existsSync(filePath)) {
					/** @type {Transaction[]} */
					const newTransactions = JSON.parse(fs.readFileSync(filePath));
					for (let i = 0, l = newTransactions.length; i < l; i++) {
						if (startDate <= newTransactions[i].date && newTransactions[i].date < end.toISOString()) {
							transactions.push(newTransactions[i]);
						}
					}
				}
				date.setUTCMonth(date.getUTCMonth() + 1);
			}
		}
		return transactions;
	}

	/**
	 * Returns a pair of lists of transactions, the first being new transactions and the second duplicates.
	 * @param {string} name
	 * @param {Transaction[]} transactions
	 * @returns {[Transaction[], Transaction[]]}
	 */
	static checkDuplicateTransactions(name, transactions) {
		// Validate the name.
		if (!this._validateName(name)) {
			throw new Error('The name "' + name + '" is not a valid account name. Please use only alphanumeric, space, underscore, and dash characters.');
		}

		const newTransactions = [];
		const duplicateTransactions = [];

		let currentTransactionsFilePath = '';
		/** @type {Transaction[]} */
		let currentTransactions = null;
		for (let transaction of transactions) {
			let date = new Date(transaction.date);
			let transactionFilePath = this.getTransactionsFilePath(name, date);
			if (currentTransactionsFilePath !== transactionFilePath) {
				if (currentTransactionsFilePath !== '') {
					this.sortTransactions(currentTransactions);
					fs.writeFileSync(currentTransactionsFilePath, JSON.stringify(currentTransactions));
				}
				currentTransactionsFilePath = transactionFilePath;
				if (!fs.existsSync(currentTransactionsFilePath)) {
					fs.writeFileSync(currentTransactionsFilePath, '');
					currentTransactions = [];
				}
				else {
					currentTransactions = JSON.parse(fs.readFileSync(currentTransactionsFilePath));
				}
			}

			// Check for a duplicate id.
			let duplicateFound = false;
			for (let otherTransaction of currentTransactions) {
				if (otherTransaction.id !== transaction.id) {
					duplicateFound = true;
				}
			}
			if (duplicateFound) {
				duplicateTransactions.push(transaction);
			}
			else {
				newTransactions.push(transaction);
			}
		}
		return [newTransactions, duplicateTransactions];
	}

	/**
	 * Adds a list of transactions to the existing transactions. Ignored transactions with duplicate ids.
	 * @param {string} name
	 * @param {Transaction[]} transactions
	 */
	static addTransactions(name, transactions) {
		// Validate the name.
		if (!this._validateName(name)) {
			throw new Error('The name "' + name + '" is not a valid account name. Please use only alphanumeric, space, underscore, and dash characters.');
		}

		// If the transactions folder doesn't already exist, create it.
		if (!fs.existsSync('data/accounts/' + name + '/transactions/')) {
			fs.mkdirSync('data/accounts/' + name + '/transactions/');
		}

		let currentTransactionsFilePath = '';
		/** @type {Transaction[]} */
		let currentTransactions = null;
		for (let transaction of transactions) {
			let date = new Date(transaction.date);
			let transactionFilePath = this.getTransactionsFilePath(name, date);
			if (currentTransactionsFilePath !== transactionFilePath) {
				if (currentTransactionsFilePath !== '') {
					this.sortTransactions(currentTransactions);
					fs.writeFileSync(currentTransactionsFilePath, JSON.stringify(currentTransactions));
				}
				currentTransactionsFilePath = transactionFilePath;
				if (!fs.existsSync(currentTransactionsFilePath)) {
					fs.writeFileSync(currentTransactionsFilePath, '');
					currentTransactions = [];
				}
				else {
					currentTransactions = JSON.parse(fs.readFileSync(currentTransactionsFilePath));
				}
			}

			// Check for a duplicate id.
			let duplicateFound = false;
			for (let otherTransaction of currentTransactions) {
				if (otherTransaction.id === transaction.id) {
					duplicateFound = true;
				}
			}
			if (!duplicateFound) {
				currentTransactions.push(transaction);
			}
		}
		if (currentTransactionsFilePath !== '') {
			this.sortTransactions(currentTransactions);
			fs.writeFileSync(currentTransactionsFilePath, JSON.stringify(currentTransactions));
		}
	}

	/**
	 * Validates the account name.
	 * @param {string} name
	 * @returns {boolean}
	 */
	static _validateName(name) {
		if (name !== name.replace(/[^\w- _']/, '') || name.length === 0) {
			return false;
		}
		return true;
	}

	/**
	 * @param {string} name
	 * @param {Date} date
	 */
	static getTransactionsFilePath(name, date) {
		return 'data/accounts/' + name + '/transactions/' + date.getUTCFullYear().toString().padStart(4, '0') + (date.getUTCMonth() + 1).toString().padStart(2, '0') + '.json';
	}

	static sortTransactions(transactions) {
		transactions.sort(function (a, b) {
			if (a.date < b.date) {
				return -1;
			}
			if (b.date > a.date) {
				return +1;
			}
			if (a.id < b.id) {
				return -1;
			}
			if (a.id > b.id) {
				return +1;
			}
			return 0;
		});
	}
}

module.exports = Accounts;
