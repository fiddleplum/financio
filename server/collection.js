class Collection {
	constructor(name) {
		/**
		 * The name of the collection.
		 * @type {string}
		 * @private
		 */
		this._name = name;
	}

	get name() {
		return this._name;
	}

	async process(res, method, tokens) {
		if (method === 'GET') {
			if (tokens.length === 0) {
				let json = await listItems();
				this._respond(res, 200, JSON.stringify(json));
			}
			else {
				try {
					let json = await getItem(tokens[0]);
					this._respond(res, 200, JSON.stringify(json));
				}
				catch (e) {
					this._respond(res, 400, 'Could not get item ' + tokens[0]);
				}
			}
		}
		else if (method === 'POST') {
			this.updateItem();
		}
		else if (method === 'PUT') {

		}
		else if (method === 'DELETE') {
			if (tokens.length === 0) {
				// _respond
			}
		}
	}

	/**
	 * Generates a new id. Returns a promise that resolves with a new id.
	 * @returns {Promise}
	 */
	getNewId() {
	}

	/**
	 * Gets the list of items. Returns a promise that resolves with a json array of strings.
	 * @returns {Promise}
	 */
	listItems() {
	}

	/**
	 * Gets an item. Returns a promise that resolves with a json object.
	 * @returns {Promise}
	 */
	async getItem(id) {
	}

	async createItem(id, json) {
	}

	async updateItem(id, json) {
	}

	async deleteItem(id) {
	}

	static _respond(res, status, message) {
		res.writeHead(status, {
			'Content-Type': 'text/plain',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST'
		});
		res.end(message);
	}
}

module.exports = Collection;
