import { SimpleApp, Component, WS } from '../../../app-ts/src/index';
import {
	Menu,
	ListAccounts,
	AddAccount,
	ViewAccount,
	RenameAccount,
	DeleteAccount,
	ImportTransactions } from './internal';
// import ImportTransactions from './pages/import_transactions';
// import ListCategories from './pages/list_categories';
import css from './financio.css';

/** The main Financio app. */
export class Financio extends SimpleApp {
	/** The WebSocket host url. */
	private serverHost = '//localhost:8081';

	/** The web socket that connects to the host. */
	public readonly server: WS;

	constructor() {
		super();

		// Start the server.
		this.server = new WS(this.serverHost);

		// Set the title.
		this.title('Financio');

		// Register the pages.
		this.registerPage('', Menu);
		this.registerPage('listAccounts', ListAccounts);
		this.registerPage('addAccount', AddAccount);
		this.registerPage('viewAccount', ViewAccount);
		this.registerPage('renameAccount', RenameAccount);
		this.registerPage('deleteAccount', DeleteAccount);
		this.registerPage('importTransactions', ImportTransactions);
		// this.registerPage('listCategories', ListCategories);

		// Wait until the web socket is connected.
		this.server.getReadyPromise().then(() => {
			this.router.processURL();
		}).catch((e) => {
			console.log(e);
			this.message('No connection could be made.');
		});
	}
}

export namespace Financio {
	export class Page extends SimpleApp.Page {
		constructor(params: Component.Params) {
			super(params);
		}

		public get app(): Financio {
			return super.app as Financio;
		}
	}
}

Financio.css = css;

Financio.setAppClass(Financio);

Financio.register();
