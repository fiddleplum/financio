import WS from './ws';
import Router from './router';
import Title from './components/title';
import MainMenu from './components/main_menu';
import Messages from './components/messages';
import AccountList from './components/account_list';
import AccountAddForm from './components/account_add_form';
import TransactionList from './components/transaction_list';

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

			// Send the command to the server to get the account info.
			const accountInfo = await this.ws.send({
				'command': 'view account',
				'name': name
			});

			if (accountInfo.type === 'credit' || accountInfo.type === 'debit') {
				if (this._main) {
					this._main.destroy();
				}
				this._main = new TransactionList('main', name, this._ws);
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
