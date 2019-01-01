/** @typedef {import('./index').default} FinancioApp */
/** @typedef {import('./ws').default} WS */
import Data from './data';

class ElemAccountList extends HTMLElement {
	constructor() {
		super();

		/**
		 * @type {FinancioApp}
		 * @private
		 */
		this._app = window.app;
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
			<div id="accounts"></div>
			`;
		this.refresh();
	}

	async refresh() {
		if (this._app.ws !== null) {
			const accounts = await Data.listAccounts(this._app.ws);
			let html = ``;
			for (let name of accounts) {
				html += `<div onclick="window.app.viewAccount('` + name + `');" class="button">` + name + `</div>`;
			}
			html += `<div onclick="window.app.showPage('elem-account-add');" class="button">+</div>`;
			this.querySelector('#accounts').innerHTML = html;
		}
	}
}

window.customElements.define('elem-account-list', ElemAccountList);

export default ElemAccountList;
