import { Component } from '@fiddleplum/app-js'

class AccountList extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 */
	constructor(elem) {
		super(elem);
		this.__html = `
			<div class="page_title">Accounts</div>
			<div id="accounts"></div>
			`;
		this.refresh();
	}

	async refresh() {
		/** @type string[]} */
		let accountNames = await window.financio.ws.send({
			'command': 'list accounts'
		});

		let html = ``;
		for (let name of accountNames) {
			html += `<div onclick="window.financio.router.pushRoute('account/` + name + `');" class="button">` + name + `</div>`;
		}
		html += `<div onclick="window.financio.router.pushRoute('accountAdd');" class="button">+</div>`;
		this.__query('#accounts').innerHTML = html;
	}
}

export default AccountList;
