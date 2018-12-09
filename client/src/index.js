import WS from './ws';
import Data from './data';
import './elem_messages';
import './elem_account_list';
import './elem_create_account';
import './elem_transaction_list';

/** @typedef {import('./elem_messages').default} ElemMessages */
/** @typedef {import('./elem_account_list').default} ElemAccountList */
/** @typedef {import('./elem_transaction_list').default} ElemTransactionList */

/**
 * The main Financio application.
 */
class App {
	constructor() {
		/**
		 * The web socket host url.
		 * @type {string}
		 * @private
		 */
		this._serverHost = '//localhost:8080';

		/**
		 * The web socket that connects to the host.
		 * @type {WS}
		 * @private
		*/
		this._ws = null;
	}

	async initialize() {
		// let urlParams = new URLSearchParams(document.location.search.substring(1));

		// Notify the user that Financio is connecting.
		this.showMessage('Financio is connecting...');

		// Create the web socket and connect to the host.
		this._ws = new WS(this._serverHost);

		// Wait until the web socket is connected.
		await this._ws.getReadyPromise();

		// Notify the user that Financio is connected.
		this.showMessage('Financio is connected.');

		document.querySelector('elem-account-list').initialize(this._ws);
	}

	/**
	 * Add a message to show to the user.
	 * @param {string} message
	 */
	showMessage(message) {
		document.querySelector('elem-messages').addMessage(message);
	}

	async createAccount(name, type) {
		// Send the command to the server.
		await Data.createAccount(this._ws, name, type);

		// Repopulate the account list.
		let elemAccountList = document.querySelector('elem-account-list');
		await elemAccountList.refresh();

		// Notify the user of success.
		this.showMessage('The account "' + name + '" was created.');

		// Show the newly created account.
		this.viewAccount(name);
	}

	async viewAccount(name) {
		// Send the command to the server to get the account info.
		const accountInfo = await Data.viewAccount(this._ws, name);

		if (accountInfo.type === 'credit' || accountInfo.type === 'debit') {
			let transactions = await Data.listTransactions(this._ws, name, '2018-01-01', '2019-01-01');
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	/**
	 * The main application.
	 * @type {App}
	 */
	window.app = new App();

	window.app.initialize();
});

export default App;
