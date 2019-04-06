import { App, WS, Router } from '../../../app-js/src/index';
import Title from './components/title';
import Notice from './components/notice';
import MainMenu from './components/main_menu';
import Messages from './components/messages';
import AccountList from './components/account_list';
import AccountAddForm from './components/account_add_form';
import TransactionList from './components/transaction_list';
import TransactionToolbar from './components/transaction_toolbar';
import Categories from './components/categories';

/**
 * The main Financio application.
 */
class Financio extends App {
	constructor() {
		super();

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
		 * The main header.
		 * @type {Title}
		 * @private
		 */
		this._header = new Title(document.body.querySelector('#header'), 'FINANCIO');

		this._notice = new Notice(document.body.querySelector('#notice'));

		this.registerPage('', MainMenu);

		this.registerPage('accounts/list', AccountList);

		this.registerPage('accounts/add', AccountAddForm);

		this.registerPage('accounts/view', TransactionList);

		this.registerPage('categories', Categories);

		// Notify the user that Financio is connecting.
		this.showPage('Notice', 'Financio is connecting...');

		// Create the web socket and connect to the host.
		this._ws = new WS(this._serverHost);

		// Wait until the web socket is connected.
		this._ws.getReadyPromise().then(() => {
			// Notify the user that Financio is connected.
			this.showPage('Notice', 'Financio is connected.');

			this.goToPage('');
			this._router.processDocumentLocation();
		}).catch((error) => {
			this.showPage('Notice', 'Financio could not connect.');
			return;
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

	showPage(type, ...params) {
		// if (this._page !== null) {
		// 	this._page.destroy();
		// }
		// let pageType = Financio.pages[type];
		// if (pageType !== null) {
		// 	try {
		// 		this._page = new pageType(document.body.querySelector('#page'), ...params);
		// 	} catch(error) {
		// 		console.log(error);
		// 	}
		// }
	}
}

Financio.pages = {
	'Notice' : Notice,
	'MainMenu' : MainMenu,
	'AccountList' : AccountList,
	'AccountAddForm' : AccountAddForm,
	'TransactionList' : TransactionList
};

App.setAppSubclass(Financio);

export default Financio;
