class Accounts {
	static async list() {
		return fsPromises.readdir('data/accounts/');
	}

	static async get(name) {
		if (!validateName(name)) {
			return Promise.reject('The name "' + name + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
		}
		let fd = await fsPromises.open('data/accounts/' + name, 'r');
		return {}
	}
	
	static async create(name, type) {
		if (!validateName(name)) {
			return Promise.reject('The name "' + name + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
		}
		await fsPromises.mkdir('data/accounts/' + name);
		await fsPromises.writeFile('data/accounts/' + name + '/info.json', JSON.stringify({
			type: type
		}));
		return {};
	}
	
	static async delete(name) {
		if (!validateName(name)) {
			return Promise.reject('The name "' + name + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
		}
		await fsPromises.unlink('data/accounts/' + name + '/info.json');
		await fsPromises.unlink('data/accounts/' + name + '/transactions.json');
		await fsPromises.rmdir('data/accounts/' + name);
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
