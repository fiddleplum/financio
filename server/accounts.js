const fs = require('fs');

const TRANSACTIONS_PER_FILE = 1000;
const MAX_TRANSACTIONS = 1000000000;

class Accounts {
	static async list() {
		return fs.promises.readdir('data/accounts/');
	}

	static async getInfo(name) {
		if (!this._validateName(name)) {
			return Promise.reject('The name "' + name + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
		}
		let fileHandle = await fs.promises.open('data/accounts/' + name + '/info.json', 'r');
		let fileContent = await fileHandle.readFile();
		return JSON.parse(fileContent);
	}
	
	static async create(name, type) {
		if (!this._validateName(name)) {
			return Promise.reject('The name "' + name + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
		}
		await fs.promises.mkdir('data/accounts/' + name);
		await fs.promises.writeFile('data/accounts/' + name + '/info.json', JSON.stringify({
			type: type
		}));
		return {};
	}
	
	static async delete(name) {
		if (!this._validateName(name)) {
			return Promise.reject('The name "' + name + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
		}

		try {
			await fs.promises.unlink('data/accounts/' + name + '/info.json');
		}
		catch (e) {}
		try {
			await fs.promises.unlink('data/accounts/' + name + '/transactions.json');
		}
		catch (e) {}
		try {
			await fs.promises.rmdir('data/accounts/' + name);
		}
		catch (e) {}
		return {}
	}

	static async listTransactions(name, start, length) {
		if (!this._validateName(name)) {
			return Promise.reject('The name "' + name + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
		}

		let transactions = [];
		let fileIndexStart = Math.floor(start / TRANSACTIONS_PER_FILE);
		let fileIndexEnd = Math.floor((start + length - 1) / TRANSACTIONS_PER_FILE);
		console.log(' ' + fileIndexStart + ' ' + fileIndexEnd);
		for (let fileIndex = fileIndexStart; fileIndex <= fileIndexEnd; fileIndex++) {
			console.log('data/accounts/' + name + '/' + fileIndex.toString().padStart(4, '0') + '.json');
			try {
				let fileHandle = await fs.promises.open('data/accounts/' + name + '/' + fileIndex.toString().padStart(4, '0') + '.json', 'r');
				let fileContent = await fileHandle.readFile();
				transactions = transactions.concat(JSON.parse(fileContent));
			}
			catch (e) {
				break;
			}
		}
		return transactions;
	}

	static async addTransactions(name, transactions) {
		if (!this._validateName(name)) {
			return Promise.reject('The name "' + name + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
		}
		let existingTransactions = await this.listTransactions(name, 0, MAX_TRANSACTIONS);
		
	}

	static _validateName(name) {
		if (name !== name.replace(/[^\w-]/, '') || name.length === 0) {
			return false;
		}
		return true;
	}	
}

module.exports = Accounts;
