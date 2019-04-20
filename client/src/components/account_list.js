import { Component } from '../../../../app-js/src/index';

export default class AccountList extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 */
	constructor(elem) {
		super(elem);
		this.refresh();
	}

	async refresh() {
		/** @type string[]} */
		let accountNames = await window.app.ws.send({
			'command': 'list accounts'
		});

		let html = ``;
		for (let name of accountNames) {
			html += `<div onclick="window.app.router.pushRoute('accounts/view/name/` + name + `');" class="button">` + name + `</div>`;
		}
		html += `<div onclick="window.app.router.pushRoute('accounts/add');" class="button">+</div>`;
		this.elem.querySelector('#accounts').innerHTML = html;
	}
}

AccountList.html = `
	<div class="page_title">Accounts</div>
	<div id="accounts"></div>
	`;
