import { SimpleApp, WS } from '../../../app-js/src/index';
import Menu from './pages/menu';
import ListAccounts from './pages/list_accounts';
import AddAccount from './pages/add_account';
import ViewAccount from './pages/view_account';
import RenameAccount from './pages/rename_account';
import DeleteAccount from './pages/delete_account';
import ImportTransactions from './pages/import_transactions';
import ListCategories from './pages/list_categories';
import style from './financio.css';

export default class Financio extends SimpleApp {
	constructor() {
		super();

		/**
		 * The WebSocket host url.
		 * @type {string}
		 * @private
		 */
		this._serverHost = '//localhost:8081';

		/**
		 * The web socket that connects to the host.
		 * @type {WS}
		 * @private
		*/
		this._server = new WS(this._serverHost);

		// Set the title.
		this.title = 'Financio';

		// Register the pages.
		this.registerPage('', Menu);
		this.registerPage('listAccounts', ListAccounts);
		this.registerPage('addAccount', AddAccount);
		this.registerPage('viewAccount', ViewAccount);
		this.registerPage('renameAccount', RenameAccount);
		this.registerPage('deleteAccount', DeleteAccount);
		this.registerPage('importTransactions', ImportTransactions);
		this.registerPage('listCategories', ListCategories);

		// Wait until the web socket is connected.
		this._server.getReadyPromise().then(() => {
			this.router.processURL();
		}).catch((e) => {
			console.log(e);
			this.message = 'No connection could be made.';
		});
	}

	get server() {
		return this._server;
	}
}

Financio.style = style;

Financio.register(Financio);

Financio.setAppClass(Financio);
