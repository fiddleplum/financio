import { WS, Router } from '@fiddleplum/app-js';
import Title from './components/title';
import Notice from './components/notice';
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

		/**
		 * The router for hash tag routing.
		 * @type {Router}
		 * @private
		 */
		this._router = new Router();

		/**
		 * The main header.
		 * @type {Title}
		 * @private
		 */
		this._header = new Title(document.body.querySelector('#header'), 'FINANCIO');

		/**
		 * The page.
		 * @type {Component}
		 * @private
		 */
		this._page = null;

		// Setup the routes.
		this._router.registerRoute('', (route) => {
			this.showPage('MainMenu');
		});
		this._router.registerRoute('accounts', (route) => {
			this.showPage('AccountList');
		});
		this._router.registerRoute('accountAdd', (route) => {
			this.showPage('AccountAddForm');
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
				this.showPage('TransactionList', name, startDate, endDate, searchTerm);

				// this._page = new TransactionList(document.body.querySelector('#main'), name, startDate, endDate, searchTerm);
				// this._toolbar = new TransactionToolbar(document.body.querySelector('#rtoolbar'), name, startDate, endDate, searchTerm);
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
		this.showPage('Notice', 'Financio is connecting...');

		// Create the web socket and connect to the host.
		this._ws = new WS(this._serverHost);

		// Wait until the web socket is connected.
		try {
			await this._ws.getReadyPromise();
		}
		catch (e) {
			this.showPage('Notice', 'Financio could not connect.');
			return;
		}

		// Notify the user that Financio is connected.
		this.showPage('Notice', 'Financio is connected.');

		// Once we're loaded up, process the route.
		this._router.processDocumentLocation();
	}

	showPage(type, ...params) {
		if (this._page !== null) {
			this._page.destroy();
		}
		let pageType = Financio.pages[type];
		if (pageType !== null) {
			try {
				this._page = new pageType(document.body.querySelector('#page'), ...params);
			} catch(error) {
				console.log(error);
			}
		}
	}
}

Financio.pages = {
	'Notice' : Notice,
	'MainMenu' : MainMenu,
	'AccountList' : AccountList,
	'AccountAddForm' : AccountAddForm,
	'TransactionList' : TransactionList
};

export default Financio;
