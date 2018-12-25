const fs = require('fs');

class Accounts {
	static initialize() {
		if (!fs.existsSync('data/')) {
			fs.mkdirSync('data/');
		}
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
		if (!this._validateName(name)) {
			throw new Error('Error: The name "' + name + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
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
	}

	static delete(name) {
		if (!this._validateName(name)) {
			throw new Error('Error: The name "' + name + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
		}

		// Delete all created files for the account.
		fs.unlinkSync('data/accounts/' + name + '.json');
		if (fs.existsSync('data/accounts/' + name + '_transactions/')) {
			let files = fs.readdirSync('data/accounts/' + name + '_transactions/');
			for (let i = 0, l = files.length; i < l; i++) {
				fs.unlinkSync('data/accounts/' + name + '_transactions/' + files[i]);
			}
			fs.rmdirSync('data/accounts/' + name + '_transactions/');
		}
	}

	static view(name) {
		if (!this._validateName(name)) {
			throw new Error('The name "' + name + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
		}

		let path = 'data/accounts/' + name + '.json';
		if (fs.existsSync(path)) {
			return JSON.parse(fs.readFileSync(path));
		}
		else {
			throw new Error('Error: The account "' + name + '" does not exist.');
		}
	}

	/**
	 * Gets a list of the transacionts.
	 * @param {string} name
	 * @param {string} startDate - format 'YYYY-MM-DD'
	 * @param {string} endDate - format 'YYYY-MM-DD'
	 */
	static listTransactions(name, startDate, endDate) {
		if (!this._validateName(name)) {
			throw new Error('The name "' + name + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
		}

		let transactions = [];
		if (fs.existsSync('data/accounts/' + name + '_transactions/')) {
			const start = new Date(startDate);
			const end = new Date(endDate);
			let date = new Date(start);
			while (date <= end) {
				const filePath = this.getTransactionsFilePath(name, date);
				console.log(filePath);
				if (fs.existsSync(filePath)) {
					transactions = transactions.concat(JSON.parse(fs.readFileSync(filePath)));
				}
				date.setMonth(date.getMonth() + 1);
			}
		}
		return transactions;
	}

	static addTransactions(name, transactions) {
		if (!this._validateName(name)) {
			throw new Error('The name "' + name + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
		}

		if (!fs.existsSync('data/accounts/' + name + '_transactions/')) {
			fs.mkdirSync('data/accounts/' + name + '_transactions/');
		}

		let currentTransactionsFilePath = '';
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
			currentTransactions.push(transaction);
		}
		if (currentTransactionsFilePath !== '') {
			this.sortTransactions(currentTransactions);
			fs.writeFileSync(currentTransactionsFilePath, JSON.stringify(currentTransactions));
		}
	}

	/**
	 * Validates the account name.
	 * @param {string} name
	 */
	static _validateName(name) {
		if (name !== name.replace(/[^\w- ']/, '') || name.length === 0) {
			return false;
		}
		return true;
	}

	/**
	 * @param {string} name
	 * @param {Date} date
	 */
	static getTransactionsFilePath(name, date) {
		return 'data/accounts/' + name + '_transactions/' + date.getFullYear().toString().padStart(4, '0') + (date.getMonth() + 1).toString().padStart(2, '0') + '.json';
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
