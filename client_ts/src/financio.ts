import { SimpleApp, Component, WS } from '../../../app-ts/src/index';
import { Menu } from './internal';
import { ListAccounts } from './internal';
import { AddAccount } from './internal';
// import ViewAccount from './pages/view_account';
// import RenameAccount from './pages/rename_account';
// import DeleteAccount from './pages/delete_account';
// import ImportTransactions from './pages/import_transactions';
// import ListCategories from './pages/list_categories';
import css from './financio.css';

export class Financio extends SimpleApp {
	/** The WebSocket host url. */
	private serverHost = '//localhost:8081';

	/** The web socket that connects to the host. */
	public readonly server: WS;

	constructor() {
		super();

		// Star tthe server.
		this.server = new WS(this.serverHost);

		// Set the title.
		this.title = 'Financio';

		// Register the pages.
		this.registerPage('', Menu);
		this.registerPage('listAccounts', ListAccounts);
		this.registerPage('addAccount', AddAccount);
		// this.registerPage('viewAccount', ViewAccount);
		// this.registerPage('renameAccount', RenameAccount);
		// this.registerPage('deleteAccount', DeleteAccount);
		// this.registerPage('importTransactions', ImportTransactions);
		// this.registerPage('listCategories', ListCategories);

		// Wait until the web socket is connected.
		this.server.getReadyPromise().then(() => {
			this.router.processURL();
		}).catch((e) => {
			console.log(e);
			this.message = 'No connection could be made.';
		});
	}
}

export namespace Financio {
	export class Page extends SimpleApp.Page {
		public readonly app: Financio;

		constructor(params: Component.Params) {
			super(params);

			const financio = params.attributes.get('app');
			if (!(financio instanceof Financio)) {
				throw new Error('While constructing page ' + this.constructor.name + ', app is not a SimpleApp.');
			}
			this.app = financio;
		}
	}
}

Financio.css = css;

Financio.setAppClass(Financio);

Financio.register();
