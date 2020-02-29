import { Component } from '../../../../app-js/src/index';
/** @typedef {import('../financio').default} Financio */

/**
 * The accounts page.
 */
export default class ListAccounts extends Component {
	/**
	 * Constructs the app.
	 * @param {Financio} financio - The app.
	 */
	constructor(financio) {
		super();

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
			html += `<button ref="${accountNames[i]}" onclick="_goToViewAccount">${accountNames[i]}</button>`;
		}
		this.__setHtml('list', html);
	}

	_goToViewAccount(event) {
		this._financio.router.pushQuery({
			page: 'viewAccount',
			name: event.target.getAttribute('ref')
		});
	}

	_goToAddAccount() {
		this._financio.router.pushQuery({
			page: 'addAccount'
		});
	}
}

ListAccounts.html = `
	<h1>Accounts</h1>
	<div ref="list"></div>
	<button onclick="_goToAddAccount">+ New Account +</button>
	`;

ListAccounts.style = `
	button.ListAccounts, .ListAccounts button {
		display: block;
		margin: 1rem auto;
		width: 10rem;
	}
	`;

ListAccounts.register(ListAccounts);
