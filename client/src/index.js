import { App, SimpleApp, WS } from '../../../app-js/src/index';
// import Page from './components/page';
// import Notice from './components/notice';
import MainMenu from './components/main_menu';
import AccountList from './components/account_list';
import AccountAddForm from './components/account_add_form';
import TransactionList from './components/transaction_list';
import TransactionToolbar from './components/transaction_toolbar';
import Categories from './components/categories';

/**
 * The main Financio application.
 */
class Financio extends SimpleApp {
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

		this.registerPage('', MainMenu);

		this.registerPage('accounts/list', AccountList);

		this.registerPage('accounts/add', AccountAddForm);

		this.registerPage('accounts/view', TransactionList);

		this.registerPage('categories/view', Categories);

		// Set the title.
		this.title = 'FINANCIO';
		this.message = 'Connecting...';

		// Create the web socket and connect to the host.
		this._ws = new WS(this._serverHost);

		// Wait until the web socket is connected.
		this._ws.getReadyPromise().then(() => {
			this.message = 'Connected.';
			this._router.processDocumentLocation();
		}).catch(() => {
			this.message = 'No connection could be made.';
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

	// showPage(type, ...params) {
	// 	// if (this._page !== null) {
	// 	// 	this._page.destroy();
	// 	// }
	// 	// let pageType = Financio.pages[type];
	// 	// if (pageType !== null) {
	// 	// 	try {
	// 	// 		this._page = new pageType(document.body.querySelector('#page'), ...params);
	// 	// 	} catch(error) {
	// 	// 		console.log(error);
	// 	// 	}
	// 	// }
	// }
}

// Financio.pages = {
// 	'Notice': Notice,
// 	'MainMenu': MainMenu,
// 	'AccountList': AccountList,
// 	'AccountAddForm': AccountAddForm,
// 	'TransactionList': TransactionList
// };

App.setAppSubclass(Financio);

export default Financio;
