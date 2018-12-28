import Data from './data';
/** @typedef {import('./ws').default} WS */

class ElemAccountList extends HTMLElement {
	constructor() {
		super();

		/** @type {WS} */
		this._ws = null;
	}

	connectedCallback() {
		this.innerHTML = `
			<style>
				elem-account-list .button {
					display: block;
					margin-bottom: .5em;
				}
			</style>
			<div class="page_title">Accounts</div>
			<div id="accounts"></div>`;
	}

	/**
	 * @param {any} options
	 */
	initialize(options) {
		this._ws = options.ws;

		this.refresh();
	}

	async refresh() {
		if (this._ws !== null) {
			const accounts = await Data.listAccounts(this._ws);
			let html = ``;
			for (let name of accounts) {
				html += `<div onclick="window.app.viewAccount('` + name + `');" class="button">` + name + `</div>`;
			}
			this.querySelector('#accounts').innerHTML = html;
		}
	}
}

window.customElements.define('elem-account-list', ElemAccountList);

export default ElemAccountList;
