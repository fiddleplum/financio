/** @typedef {import('./index').default} FinancioApp */
/** @typedef {import('./ws').default} WS */
import Data from './data';

class ElemAccountList extends HTMLElement {
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
		const accounts = await Data.listAccounts();
		let html = ``;
		for (let name of accounts) {
			html += `<div onclick="window.app.showPage('account/` + name + `');" class="button">` + name + `</div>`;
		}
		html += `<div onclick="window.app.showPage('accountadd');" class="button">+</div>`;
		this.querySelector('#accounts').innerHTML = html;
	}
}

window.customElements.define('elem-account-list', ElemAccountList);

export default ElemAccountList;
