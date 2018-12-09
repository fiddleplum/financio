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
			<div class="title">Accounts</div>
			<div id="accounts"></div>`;
	}

	/**
	 * @param {WS} ws
	 */
	initialize(ws) {
		this._ws = ws;

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
