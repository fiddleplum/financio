import WS from './ws';
import Data from './data';
import './elem_messages';
import './elem_account_list';
import './elem_create_account';
import './elem_transaction_list';
import './elem_account_toolbar';

/** @typedef {import('./elem_messages').default} ElemMessages */
/** @typedef {import('./elem_account_list').default} ElemAccountList */
/** @typedef {import('./elem_create_account').default} ElemCreateAccount */
/** @typedef {import('./elem_transaction_list').default} ElemTransactionList */
/** @typedef {import('./elem_account_toolbar').default} ElemAccountToolbar */

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

		let elemAccountList = document.createElement('elem-account-list');
		elemAccountList.initialize(this._ws);
		document.body.querySelector('#nav').appendChild(elemAccountList);

		let elemCreateAccount = document.createElement('elem-create-account');
		document.body.querySelector('#nav').appendChild(elemCreateAccount);
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
		try {
			await Data.createAccount(this._ws, name, type);
		}
		catch (errorMessage) {
			this.showMessage(errorMessage);
			return;
		}

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
			let elemTransactionList = document.createElement('elem-transaction-list');
			elemTransactionList.initialize(this._ws, name);
			document.body.querySelector('#main').innerHTML = '';
			document.body.querySelector('#main').appendChild(elemTransactionList);

			let elemAccountToolbar = document.createElement('elem-account-toolbar');
			elemAccountToolbar.initialize(this._ws, name);
			document.body.querySelector('#right').innerHTML = '';
			document.body.querySelector('#right').appendChild(elemAccountToolbar);
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
