import { Component } from '../../../../app-js/src/index';
import './accounts.css';
/** @typedef {import('../index').default} Financio */

/**
 * The accounts page.
 */
export default class Accounts extends Component {
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

		this.on('addAccount', 'click', this._goToAddAccount);

		this._populateAccountNames();
	}

	async _populateAccountNames() {
		/** @type string[]} */
		const accountNames = await this._financio.server.send({
			command: 'list accounts'
		});

		const listElem = this.elem.querySelector('#list');
		for (let i = 0, l = accountNames.length; i < l; i++) {
			const button = this.createElement('button', accountNames[i], '', { click: this._goToViewAccount });
			button.innerHTML = accountNames[i];
			listElem.appendChild(button);
		}
	}

	_goToViewAccount(event) {
		this._financio.router.push({
			page: 'viewAccount',
			name: event.target.id
		});
	}

	_goToAddAccount(event) {
		this._financio.router.push({
			page: 'addAccount'
		});
	}
}

Accounts.html = `
	<h1>Accounts</h1>
	<div id="list"></div>
	<button id="addAccount">+ New Account +</button>
	`;
