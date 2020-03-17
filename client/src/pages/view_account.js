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
	 * Constructor.
	 * @param {Component.Params} params
	 */
	constructor(params) {
		super(params);

		/**
		 * The app.
		 * @type {Financio}
		 * @private
		 */
		this._app = params.attributes.get('app');

		/**
		 * The name of the account to view.
		 * @type {string}
		 * @private
		 */
		this._name = this._app.router.getValue('name');

		this._element('accountName').innerHTML = this._name;

		this._transactions = new Transactions(this.get('transactions'), this._app);
	}

	_goToRenameAccount() {
		this._app.router.pushQuery({
			page: 'renameAccount',
			name: this._name
		});
	}

	_goToDeleteAccount() {
		this._app.router.pushQuery({
			page: 'deleteAccount',
			name: this._name
		});
	}
}

ViewAccount.html = html;
ViewAccount.css = css;

ViewAccount.register();
