import { SimpleApp, WS } from '../../../app-js/src/index';
import Menu from './components/menu';
import Accounts from './components/accounts';
import AddAccount from './components/add_account';
import ViewAccount from './components/view_account';
import RenameAccount from './components/rename_account';
import DeleteAccount from './components/delete_account';
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
		this.registerPage('accounts', Accounts);
		this.registerPage('addAccount', AddAccount);
		this.registerPage('viewAccount', ViewAccount);
		this.registerPage('renameAccount', RenameAccount);
		this.registerPage('deleteAccount', DeleteAccount);

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

Financio.setAppClass(Financio);
