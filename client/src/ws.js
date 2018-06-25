import UniqueIds from './unique_ids';

/**
 * A message sending and receiving WebSocket interface.
 */
class WS {
	constructor(url) {
		/**
		 * The WebSocket connection.
		 * @type {WebSocket}
		 * @private
		 */
		this._webSocket = null;

		/**
		 * A promise that resolves when the WebSocket connection is open.
		 * @type {Promise}
		 * @private
		 */
		this._readyPromise = null;

		/**
		 * A collection of unique ids for pairing received messages with sent messages.
		 * @type {UniqueIds}
		 * @private
		 */
		this._uniqueIds = new UniqueIds();

		/**
		 * The list of active sent messages awaitin a received message.
		 * @type {Map<number, function()>}
		 * @private
		 */
		this._activeSends = new Map();

		// Initialize.
		this._webSocket = new WebSocket('ws:' + url);

		this._readyPromise = new Promise((resolve, reject) => {
			this._webSocket.onopen = resolve;
		});

		this._webSocket.onmessage = (message) => {
			console.log('received ' + message.data);
			let json = JSON.parse(message.data);
			let resolve = this._activeSends.get(json.id);
			this._activeSends.delete(json.id);
			resolve(json.data);
		};
		window.addEventListener('beforeunload', () => {
			this._webSocket.close();
		});
	}

	getReadyPromise() {
		return this._readyPromise;
	}

	/**
	 * Closes the web socket connection.
	 */
	close() {
		this._webSocket.close();
	}

	/**
	 * Sends the JSON data along the web socket. Returns a promise resolving with response JSON data.
	 * @returns {Promise}
	 */
	send(data) {
		return new Promise((resolve, reject) => {
			let id = this._uniqueIds.get();
			let json = {
				id: id,
				data: data
			};
			this._activeSends.set(id, resolve);
			this._webSocket.send(JSON.stringify(json));
		});
	}
}

export default WS;
