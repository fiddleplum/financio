/** @typedef {import('./ws').default} WS */

class Data {
	/**
	 * Sends to the websocket a 'delete account' message.
	 * @param {string} name
	 */
	static async deleteAccount(name) {
		await window.app.ws.send({
			'command': 'delete account',
			'name': name
		});
	}
}

export default Data;
