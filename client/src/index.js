import WS from './ws';
import './elem_mesage';
import './elem_account_list';
import './elem_transaction_list';

/**
 * The main Financio application.
 */
class App {
	static async initialize() {
		// Connect the web socket to the server host.
		this.ws = new WS(this.serverHost);

		// Notify the user that Financio is connecting.
		this.showMessage('Financio is connecting...');

		// Wait for it to connect.
		await this.ws.getReadyPromise();

		// Notify the user that Financio has connected.
		this.showMessage('Financio is connected.');

		document.querySelector('elem-account-list').initialize(this.ws, document.querySelector('elem-message'));
	}

	/**
	 * Add a message to show to the user.
	 * @param {string} message
	 */
	static showMessage(message) {
		document.querySelector('elem-message').addMessage(message);
	}

	static async deleteAccount(name) {
		await this.ws.send({
			'command': 'delete account',
			'name': name
		});

		// Notify the user of success.
		this.showMessage('The account "' + name + '" was deleted.');

		// Repopulate the account list.
		await this.populateAccountList();
	}

	static async viewAccount(name) {
		let accountInfo = await this.ws.send({
			'command': 'get account info',
			'name': name
		});

		let html = '<h2>' + name + '</h2>';
		html += '<h3>' + accountInfo.type + '</h3>';
		html += '<elem-transaction-list></elem-transaction-list>';

		document.querySelector('#view').innerHTML = html;
		document.querySelector('elem-transaction-list').initialize(this.ws, document.querySelector('elem-message'), name);
	}
}

/**
 * This is the web socket host url.
 * @type {string}
 * @private
 */
App.serverHost = '//localhost:8080';

/**
 * The web socket.
 * @type {WebSocket}
 * @private
 */
App.ws = null;

document.addEventListener('DOMContentLoaded', () => {
	window.App = App;

	App.initialize();
});

export default App;
