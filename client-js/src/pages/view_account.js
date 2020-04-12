import { Component } from '../../../../app-js/src/index';
import TransactionList from '../components/transaction_list';
import html from './view_account.html';
import css from './view_account.css';
/** @typedef {import('../financio').default} Financio */

/**
 * The view accounts page.
 */
export default class ViewAccount extends Component {
	/**
	 * Constructor.
	 * @param {Financio} app
	 */
	constructor(app) {
		super();

		/**
		 * The app.
		 * @type {Financio}
		 * @private
		 */
		this._app = app;

		/**
		 * The name of the account to view.
		 * @type {string}
		 * @private
		 */
		this._name = this._app.router.getValue('name');

		this.__element('accountName').innerHTML = this._name;

		// const transactionList = this.__component('transactionList');
		// if (transactionList instanceof TransactionList) {
		// }
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
