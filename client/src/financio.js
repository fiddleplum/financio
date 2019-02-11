import { WS, Router } from 'app-js';
import Title from './components/title';
import MainMenu from './components/main_menu';
import Messages from './components/messages';
import AccountList from './components/account_list';
import AccountAddForm from './components/account_add_form';
import TransactionList from './components/transaction_list';
import TransactionToolbar from './components/transaction_toolbar';

/**
 * The main Financio application.
 */
class Financio {
	constructor() {
		window.financio = this;

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

		this._router = new Router();

		this._title = new Title('header', 'FINANCIO');
		this._toolbar = null;
		this._main = null;
		this._messages = new Messages('footer');

		this._router.registerRoute('', (route) => {
			if (this._main) {
				this._main.destroy();
			}
			this._main = new MainMenu('main');
		});
		this._router.registerRoute('accounts', (route) => {
			if (this._main) {
				this._main.destroy();
			}
			this._main = new AccountList('main');
		});
		this._router.registerRoute('accountAdd', (route) => {
			if (this._main) {
				this._main.destroy();
			}
			this._main = new AccountAddForm('main');
		});
		this._router.registerRoute('account/.*', async (route) => {
			let name = route[1];
			let endDate = new Date();
			let startDate = new Date();
			startDate.setMonth(endDate.getMonth() - 3);
			let searchTerm = '';
			for (let i = 2; i < route.length - 1; i++) {
				if (route[i] === 'from') {
					let year = route[i + 1].substr(0, 4);
					let month = route[i + 1].substr(5, 2);
					startDate = new Date(year, month - 1);
				}
				else if (route[i] === 'to') {
					let year = route[i + 1].substr(0, 4);
					let month = route[i + 1].substr(5, 2);
					endDate = new Date(year, month - 1);
				}
				if (route[i] === 'search') {
					searchTerm = route[i + 1];
				}
			}

			// Send the command to the server to get the account info.
			const accountInfo = await this.ws.send({
				'command': 'view account',
				'name': name
			});

			if (accountInfo.type === 'credit' || accountInfo.type === 'debit') {
				if (this._main) {
					this._main.destroy();
				}
				this._main = new TransactionList('main', name, startDate, endDate, searchTerm);
				this._toolbar = new TransactionToolbar('rtoolbar', name, startDate, endDate, searchTerm);
			}
		});
	}

	/**
	 * Gets the router.
	 * @returns {Router}
	 */
	get router() {
		return this._router;
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

		// Once we're loaded up, process the route.
		this._router.processDocumentLocation();
	}

	/**
	 * Add a message to show to the user.
	 * @param {string} message
	 */
	showMessage(message) {
		this._messages.addMessage(message);
	}
}

export default Financio;
