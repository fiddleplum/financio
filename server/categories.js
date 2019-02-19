const fs = require('fs');

class Categories {
	static get() {
		if (fs.existsSync('data/categories.json')) {
			return fs.readFileSync('data/categories.json');
		}
		return [];
	}

	static set(categories) {
		if (!this._validateName(name)) {
			throw new Error('Error: The name "' + name + '" is not a valid category name. Please use only alphanumeric, underscore, and dash characters.');
		}

		// Create the .json file.
		try {
			fs.writeFileSync('data/categories/' + name + '.json', JSON.stringify(category));
		}
		catch (error) {
			throw new Error('Error: The file "data/categories/' + name + '.json" could not be written to. ' + error);
		}
	}

	static delete(name) {
		if (!this._validateName(name)) {
			throw new Error('Error: The name "' + name + '" is not a valid category name. Please use only alphanumeric, underscore, and dash characters.');
		}

		// Delete all created files for the category.
		fs.unlinkSync('data/categories/' + name + '.json');
		if (fs.existsSync('data/categories/' + name + '_transactions/')) {
			let files = fs.readdirSync('data/categories/' + name + '_transactions/');
			for (let i = 0, l = files.length; i < l; i++) {
				fs.unlinkSync('data/categories/' + name + '_transactions/' + files[i]);
			}
			fs.rmdirSync('data/categories/' + name + '_transactions/');
		}
	}

	static view(name) {
		if (!this._validateName(name)) {
			throw new Error('The name "' + name + '" is not a valid category name. Please use only alphanumeric, underscore, and dash characters.');
		}

		let path = 'data/categories/' + name + '.json';
		if (fs.existsSync(path)) {
			return JSON.parse(fs.readFileSync(path));
		}
		else {
			throw new Error('Error: The category "' + name + '" does not exist.');
		}
	}

	/**
	 * Validates the category name.
	 * @param {(string|Array<string>)[]} categories
	 * @returns {boolean}
	 */
	static _validate(categories) {
		for (let i = 0, l = categories.length; i < l; i++) {
			if (categories[i].constructor === Array) {
				if (!this._validate(categories[i])) {
					return false;
				}
			}
		}
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
		return 'data/categories/' + name + '_transactions/' + date.getFullYear().toString().padStart(4, '0') + (date.getMonth() + 1).toString().padStart(2, '0') + '.json';
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

module.exports = Categories;
