import { Component } from '../../../../app-js/src/index';
/** @typedef {import('../financio').default} Financio */

/**
 * The list accounts page.
 */
export default class ListAccounts extends Component {
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

		this._populateAccountNames();
	}

	async _populateAccountNames() {
		/** @type string[]} */
		const accountNames = await this._app.server.send({
			command: 'list accounts'
		});

		// const listElem = this.elem.querySelector('#list');
		let html = '';
		for (let i = 0, l = accountNames.length; i < l; i++) {
			html += `<button ref="${accountNames[i]}" onclick="_goToViewAccount">${accountNames[i]}</button>`;
		}
		this.__setHtml(this.__element('list'), html);
	}

	/**
	 * @param {Event} event
	 */
	_goToViewAccount(event) {
		console.log(event);
		if (event.target instanceof HTMLElement) {
			this._app.router.pushQuery({
				page: 'viewAccount',
				name: event.target.getAttribute('ref')
			});
		}
	}

	_goToAddAccount() {
		this._app.router.pushQuery({
			page: 'addAccount'
		});
	}
}

ListAccounts.html = `
	<h1>Accounts</h1>
	<div ref="list"></div>
	<button onclick="_goToAddAccount">+ New Account +</button>
	`;

ListAccounts.css = `
	button.ListAccounts, .ListAccounts button {
		display: block;
		margin: 1rem auto;
		width: 10rem;
	}
	`;

ListAccounts.register();
