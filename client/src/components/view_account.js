import { Component } from '../../../../app-js/src/index';
// import Transactions from './transactions';
import style from './view_account.css';
import trashSVG from './trash.svg';
import editSVG from './edit.svg';
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
	<button id="renameAccount">` + editSVG + `</button> <button id="deleteAccount">` + trashSVG + `</button>
	</div>
	<div id="transactions"></div>
	`;

ViewAccount.style = style;
