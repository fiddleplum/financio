import { UIComponent } from '../../../../app-js/src/index';

export default class AccountList extends UIComponent {
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
			html += `<button class="menuItem" onclick="window.app.router.pushRoute('accounts/view/name/` + name + `');">` + name + `</button>`;
		}
		html += ``;
		this.elem.querySelector('#list').innerHTML = html;
	}
}

AccountList.html = `
	<h1>Accounts</h1>
	<div id="list" class="menu"></div>
	<button id="add" onclick="window.app.router.pushRoute('accounts/add');" class="button">+</button>
	`;

AccountList.style = `
	.AccountList #add {
		background: var(--bg-medium);
		color: var(--fg-medium);
	}
	`;
