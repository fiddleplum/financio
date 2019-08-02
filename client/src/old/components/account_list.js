import { Component } from '../../../../app-js/src/index';
/** @typedef {import('../index').default} FinancioApp */

export default class AccountList extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 * @param {FinancioApp} app
	 */
	constructor(elem, app) {
		super(elem);

		/**
		 * A reference to the app.
		 * @type {FinancioApp}
		 * @private
		 */
		this._app = app;

		this.elem.querySelector('#add').addEventListener('click', () => {
			this._app.query.push({ section: 'accounts', action: 'new' });
		});

		this.refresh();
	}

	async refresh() {
		/** @type string[]} */
		let accountNames = await this._app.ws.send({
			'command': 'list accounts'
		});

		const list = this.elem.querySelector('#list');
		for (let name of accountNames) {
			const aElem = document.createElement('div');
			aElem.classList.add('button');
			aElem.innerHTML = name;
			aElem.addEventListener('click', (event) => {
				this._app.query.push({ section: 'accounts', action: 'view', name: name });
			});
			list.appendChild(aElem);
		}
	}
}

AccountList.html = `
	<h1>Accounts</h1>
	<div id="list"></div>
	<div id="add" class="button">Create a New Account</div>
	`;

AccountList.style = `
	.AccountList .button {
		max-width: 16em;
		margin-left: auto;
		margin-right: auto;
	}
	`;
