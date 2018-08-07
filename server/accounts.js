const fs = require('fs');

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

	static _validateName(name) {
		if (name !== name.replace(/[^\w-]/, '') || name.length === 0) {
			return false;
		}
		return true;
	}	
}

module.exports = Accounts;
