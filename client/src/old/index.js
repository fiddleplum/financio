import { SimpleApp, WS } from '../../../app-js/src/index';
import MainMenu from './components/main_menu';
import AccountList from './components/account_list';
import AccountAddForm from './components/account_add_form';
import TransactionList from './components/transaction_list';
import Categories from './components/categories';

/**
 * The main Financio application.
 */
class FinancioApp extends SimpleApp {
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
		this._ws = new WS(this._serverHost);

		this.title = 'FINANCIO';

		this.registerPage({}, MainMenu);

		this.registerPage({ section: 'accounts' }, AccountList);

		this.registerPage({ section: 'accounts', action: 'new' }, AccountAddForm);

		this.registerPage({ section: 'accounts', action: 'view' }, TransactionList);

		this.registerPage({ section: 'categories', action: 'view' }, Categories);

		// Wait until the web socket is connected.
		this._ws.getReadyPromise().then(() => {
			this.message = 'Connected.';
			this.query.processLocation();
		}).catch(() => {
			this.message = 'No connection could be made.';
		});
	}

	/**
	 * Gets the web socket that connects to the host.
	 * @returns {WS};
	 */
	get ws() {
		return this._ws;
	}
}

SimpleApp.setAppClass(FinancioApp);

export default FinancioApp;
