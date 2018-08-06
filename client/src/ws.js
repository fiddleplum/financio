import UniqueIds from './unique_ids';

/**
 * This callback is displayed as a global member.
 * @callback receivedPromiseResolve
 * @param {*} data
 */

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
		 * The list of active sent messages awaiting a received message.
		 * @type {Map<number, receivedPromiseResolve>}
		 * @private
		 */
		this._activeSends = new Map();

		// Create the web socket.
		this._webSocket = new WebSocket('ws:' + url);

		// Setup the promise that resolves when the web socket is ready to be used.
		this._readyPromise = new Promise((resolve, reject) => {
			this._webSocket.onopen = resolve;
		});

		// When a message is received...
		this._webSocket.onmessage = (message) => {
			console.log('received ' + message.data);

			// Get the json and the id.
			let json = JSON.parse(message.data);
			let id = json.id;

			// Get the function to be resolved using the id in the json.
			let resolve = this._activeSends.get(id);

			// Remove the id from the actively sending message list and release the id.
			this._activeSends.delete(id);
			this._uniqueIds.release(id);

			// Call the resolve function.
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
