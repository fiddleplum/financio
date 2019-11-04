import { Component } from '../../../../app-js/src/index';
/** @typedef {import('../financio').default} Financio */

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

		this._populateAccountNames();
	}

	async _populateAccountNames() {
		/** @type string[]} */
		const accountNames = await this._financio.server.send({
			command: 'list accounts'
		});

		// const listElem = this.elem.querySelector('#list');
		let html = '';
		for (let i = 0, l = accountNames.length; i < l; i++) {
			html += `<button id="${accountNames[i]}" onclick="_goToViewAccount">${accountNames[i]}</button>`;
		}
		this.setHtml('list', html);
	}

	_goToViewAccount(event) {
		this._financio.router.pushQuery({
			page: 'viewAccount',
			name: event.target.id
		});
	}

	_goToAddAccount(event) {
		this._financio.router.pushQuery({
			page: 'addAccount'
		});
	}
}

Accounts.html = `
	<h1>Accounts</h1>
	<div id="list"></div>
	<button onclick="_goToAddAccount">+ New Account +</button>
	`;

Accounts.style = `
	.Accounts button {
		display: block;
		margin: 1rem auto;
		width: 10rem;
	}
	`;
