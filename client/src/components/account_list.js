import Data from '../data';
import Component from '../component';

class AccountList extends Component {
	constructor(gridArea) {
		super(gridArea);
		this._div.innerHTML = `
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
		this.__div.querySelector('#accounts').innerHTML = html;
	}
}

export default AccountList;
