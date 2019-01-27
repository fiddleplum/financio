import WS from './ws';
import Data from './data';
import Title from './components/title';
import MainMenu from './components/main_menu';
import Messages from './components/messages';
import AccountList from './components/account_list';

/**
 * The main Financio application.
 */
class FinancioApp {
	constructor() {
		window.app = this;

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

		this._title = new Title('header', 'FINANCIO');
		this._main = null;
		this._messages = new Messages('footer');
	}

	/**
	 * Gets the web socket that connects to the host.
	 * @returns {WS};
	 */
	get ws() {
		return this._ws;
	}

	async initialize() {
		// Notify the user that Financio is connecting.
		this.showMessage('Financio is connecting...');

		// Create the web socket and connect to the host.
		this._ws = new WS(this._serverHost);

		// Wait until the web socket is connected.
		try {
			await this._ws.getReadyPromise();
		}
		catch (e) {
			this.showMessage('Financio could not connect.');
			return;
		}

		// Notify the user that Financio is connected.
		this.showMessage('Financio is connected.');

		// Show the main menu.
		this._main = new MainMenu('main');
	}

	/**
	 * Add a message to show to the user.
	 * @param {string} message
	 */
	showMessage(message) {
		this._messages.addMessage(message);
	}

	async listAccounts() {
		this._main.destroy();
		this._main = new AccountList('main');
	}

	async createAccount(name, type) {
		// Send the command to the server.
		try {
			await Data.createAccount(name, type);
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
		const accountInfo = await Data.viewAccount(name);

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

document.addEventListener('DOMContentLoaded', async () => {
	/**
	 * @type {number}
	 * @global
	 */
	new FinancioApp();
	await window.app.initialize();
});

export default FinancioApp;
