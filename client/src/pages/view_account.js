import { Component } from '../../../../app-js/src/index';
import '../components/transaction_list';
import html from './view_account.html';
import css from './view_account.css';
/** @typedef {import('../financio').default} Financio */

/**
 * The view accounts page.
 */
export default class ViewAccount extends Component {
	/**
	 * Constructs the app.
	 * @param {HTMLElement} elem - The element inside which the component will reside.
	 * @param {Financio} financio - The app.
	 */
	constructor(elem, financio) {
		super(elem);

		/**
		 * The app.
		 * @type {Financio}
		 * @private
		 */
		this._financio = financio;

		/**
		 * The name of the account to view.
		 * @type {string}
		 * @private
		 */
		this._name = this._financio.router.getValue('name');

		this.get('accountName').innerHTML = this._name;

		this._transactions = new Transactions(this.get('transactions'), this._financio);

		this.on('renameAccount', 'click', this.goToRenameAccount);
		this.on('deleteAccount', 'click', this.goToDeleteAccount);
	}

	goToRenameAccount() {
		this._financio.router.pushQuery({
			page: 'renameAccount',
			name: this._name
		});
	}

	goToDeleteAccount() {
		this._financio.router.pushQuery({
			page: 'deleteAccount',
			name: this._name
		});
	}
}

ViewAccount.html = html;
ViewAccount.css = css;

ViewAccount.register();
