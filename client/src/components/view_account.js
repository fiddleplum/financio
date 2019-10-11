import { Component } from '../../../../app-js/src/index';
// import Transactions from './transactions';
import './view_account.css';
import TrashSVG from './trash.svg';
import EditSVG from './edit.svg';
/** @typedef {import('../financio').default} Financio */

/**
 * The view accounts page.
 */
export default class ViewAccount extends Component {
	/**
	 * Constructs the app.
	 * @param {HTMLElement} elem - The element inside which thee the component will reside.
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
		this._name = this._financio.router.getValueOf('name');

		this.elem.querySelector('#accountName').innerHTML = this._name;

		this.on('renameAccount', 'click', this.goToRenameAccount);
		this.on('deleteAccount', 'click', this.goToDeleteAccount);
	}

	goToRenameAccount() {
		this._financio.router.push({
			page: 'renameAccount',
			name: this._name
		});
	}

	goToDeleteAccount() {
		this._financio.router.push({
			page: 'deleteAccount',
			name: this._name
		});
	}
}

ViewAccount.html = `
	<h1 id="accountName"></h1>
	<div class="toolbar">
	<button id="renameAccount"><EditSVG /></button> <button id="deleteAccount"><TrashSVG /></button>
	</div>
	<div id="transactions"></div>
	`;
