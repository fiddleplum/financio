const fs = require('fs');
/** @typedef {import('../src/transaction').default} Transaction */

class Accounts {
	static initialize() {
		if (!fs.existsSync('data/accounts/')) {
			fs.mkdirSync('data/accounts/');
		}
	}

	static loadAccounts() {
		try {
			return JSON.parse(fs.readFileSync('data/accounts.json'));
		}
		catch (error) {
			throw new Error('The file "data/accounts.json" could not be read. ' + error);
		}
	}

	static saveAccounts(accounts) {
		try {
			fs.writeFileSync('data/accounts.json', JSON.stringify(accounts));
		}
		catch (error) {
			throw new Error('The file "data/accounts.json" could not be written to. ' + error);
		}
	}

	static getAccountIndex(name, accounts) {
		for (let i = 0; i < accounts.length; i++) {
			if (accounts[i].name === name) {
				return i;
			}
		}
		return undefined;
	}

	static list() {
		return this.loadAccounts();
	}

	static create(name, type) {
		// Validate the name.
		if (!this._validateName(name)) {
			throw new Error('The name "' + name + '" is not a valid account name. Please use only alphanumeric, space, underscore, and dash characters.');
		}

		// Load the accounts file.
		const accounts = this.loadAccounts();

		// Verify that the name doesn't already exist.
		if (this.getAccountIndex(name, accounts) !== undefined) {
			throw new Error('The name "' + name + '" already exists.');
		}

		// Find the next free id.
		let id = 0;
		while (true) {
			let idTaken = false;
			for (let i = 0; i < accounts.length; i++) {
				if (accounts[i].id === id) {
					idTaken = true;
					break;
				}
			}
			if (!idTaken) {
				break;
			}
			id++;
		}

		// Create the account JSON.
		const account = {
			id: id,
			name: name,
			type: type
		};
		accounts.push(account);

		// Save the accounts file.
		this.saveAccounts(accounts);

		// Create the data folder.
		try {
			if (!fs.existsSync('data/accounts/' + id + '/')) {
				fs.mkdirSync('data/accounts/' + id + '/');
			}
		}
		catch (error) {
			throw new Error('The folder "data/accounts/' + id + '/" could not be created. ' + error);
		}
	}

	static delete(name) {
		// Validate the name.
		if (!this._validateName(name)) {
			throw new Error('The name "' + name + '" is not a valid account name. Please use only alphanumeric, space, underscore, and dash characters.');
		}

		// Load the accounts file.
		const accounts = this.loadAccounts();

		// Delete the account JSON.
		const accountIndex = this.getAccountIndex(name, accounts);
		if (accountIndex === undefined) {
			throw new Error('The name "' + name + '" does not exist.');
		}
		const accountFolder = 'data/accounts/' + accounts[accountIndex].id;
		accounts.splice(accountIndex, 1);

		// Save the accounts file.
		this.saveAccounts(accounts);

		// Delete all created folders and files for the account.
		if (fs.existsSync(accountFolder)) {
			if (fs.existsSync(accountFolder + '/transactions/')) {
				let files = fs.readdirSync(accountFolder + '/transactions/');
				for (let i = 0, l = files.length; i < l; i++) {
					fs.unlinkSync(accountFolder + '/transactions/' + files[i]);
				}
				fs.rmdirSync(accountFolder + '/transactions/');
			}
			fs.rmdirSync(accountFolder);
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

		// Load the accounts file.
		const accounts = this.loadAccounts();

		// Verify that the newName doesn't already exist.
		if (this.getAccountIndex(newName, accounts) !== undefined) {
			throw new Error('The name "' + newName + '" already exists.');
		}

		// Rename the account JSON.
		const accountIndex = this.getAccountIndex(name, accounts);
		if (accountIndex === undefined) {
			throw new Error('The name "' + name + '" does not exist.');
		}
		accounts[accountIndex].name = newName;

		// Save the accounts file.
		this.saveAccounts(accounts);
	}

	static view(name) {
		// Validate the name.
		if (!this._validateName(name)) {
			throw new Error('The name "' + name + '" is not a valid account name. Please use only alphanumeric, space, underscore, and dash characters.');
		}

		// Load the accounts file.
		const accounts = this.loadAccounts();

		// Return the account.
		const accountIndex = this.getAccountIndex(newName, accounts);
		if (accountIndex === undefined) {
			throw new Error('The name "' + name + '" does not exist.');
		}
		return accounts[accountIndex];
	}

	/**
	 * Gets a list of the transactions.
	 * @param {string} name
	 * @param {string} startDate - ISO format
	 * @param {string} endDate - ISO format
	 * @param {string} search - The search string. If it starts and ends with / or /[a-z], it is interpreted a regular expression.
	 * @param {string} minAmount - The minimum amount.
	 * @param {string} maxAmount - The maximum amount.
	 * @returns {Transaction[]}
	 */
	static listTransactions(name, startDate, endDate, search, minAmount, maxAmount) {
		// Validate the name.
		if (!this._validateName(name)) {
			throw new Error('The name "' + name + '" is not a valid account name. Please use only alphanumeric, space, underscore, and dash characters.');
		}

		// Load the accounts file.
		const accounts = this.loadAccounts();

		// Return the account.
		const accountIndex = this.getAccountIndex(newName, accounts);
		if (accountIndex === undefined) {
			throw new Error('The name "' + name + '" does not exist.');
		}

		// Prepare the regular expression for searching.
		let regExp = /.*/;
		if (search) {
			if (/^\/[^/]*\/[a-z]*$/.test(search)) {
				const lastSlashIndex = search.lastIndexOf('/');
				regExp = new RegExp(search.substr(1, lastSlashIndex - 1), search.substr(lastSlashIndex + 1));
				console.log(regExp);
			}
			else {
				regExp = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
			}
		}

		// Prepare the min and max amounts.
		if (minAmount === '') {
			minAmount = Number.NEGATIVE_INFINITY;
		}
		else {
			minAmount = parseInt(minAmount);
		}
		if (maxAmount === '') {
			maxAmount = Number.POSITIVE_INFINITY;
		}
		else {
			maxAmount = parseInt(maxAmount);
		}

		/** @type {Transaction[]} */
		let transactions = [];
		const accountFolder = 'data/accounts/' + accounts[accountindex].id;
		if (fs.existsSync(accountFolder + '/transactions/')) {
			let date = new Date(startDate);
			const end = new Date(endDate);
			end.setUTCDate(end.getUTCDate() + 1); // Make it the next day to include the actual end date's transactions.
			while (date.getTime() < end.getTime()) {
				const filePath = this.getTransactionsFilePath(accountFolder, date);
				if (fs.existsSync(filePath)) {
					/** @type {Transaction[]} */
					const newTransactions = JSON.parse(fs.readFileSync(filePath));
					for (let i = 0, l = newTransactions.length; i < l; i++) {
						const newTransaction = newTransactions[i];
						if (newTransaction.date < startDate || end.toISOString() <= newTransaction.date) {
							continue;
						}
						if (!regExp.test(newTransaction.description) && !regExp.test(newTransaction.notes)) {
							continue;
						}
						if (newTransaction.amount < minAmount || maxAmount < newTransaction.amount) {
							continue;
						}
						transactions.push(newTransaction);
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

		// Load the accounts file.
		const accounts = this.loadAccounts();

		// Get the account.
		const accountIndex = this.getAccountIndex(newName, accounts);
		if (accountIndex === undefined) {
			throw new Error('The name "' + name + '" does not exist.');
		}
		const accountFolder = 'data/accounts/' + accounts[accountindex].id;

		const newTransactions = [];
		const duplicateTransactions = [];

		let currentTransactionsFilePath = '';
		/** @type {Transaction[]} */
		let currentTransactions = null;
		for (let transaction of transactions) {
			let date = new Date(transaction.date);
			let transactionFilePath = this.getTransactionsFilePath(accountFolder, date);
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

		// Get the account.
		const accountIndex = this.getAccountIndex(newName, accounts);
		if (accountIndex === undefined) {
			throw new Error('The name "' + name + '" does not exist.');
		}
		const accountFolder = 'data/accounts/' + accounts[accountindex].id;

		// If the transactions folder doesn't already exist, create it.
		if (!fs.existsSync(accountFolder + '/transactions/')) {
			fs.mkdirSync(accountFolder + '/transactions/');
		}

		let currentTransactionsFilePath = '';
		/** @type {Transaction[]} */
		let currentTransactions = null;
		for (let transaction of transactions) {
			let date = new Date(transaction.date);
			let transactionFilePath = this.getTransactionsFilePath(accountFolder, date);
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
	static getTransactionsFilePath(accountFolder, date) {
		return accountFolder + '/transactions/' + date.getUTCFullYear().toString().padStart(4, '0') + (date.getUTCMonth() + 1).toString().padStart(2, '0') + '.json';
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
