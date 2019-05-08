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

		const list = this.elem.querySelector('#list');
		for (let name of accountNames) {
			const aElem = document.createElement('a');
			aElem.setAttribute('href', 'javascript:;');
			aElem.classList.add('menuItem');
			aElem.innerHTML = name;
			aElem.addEventListener('click', (event) => {
				window.app.router.pushRoute('accounts/view/name/' + name);
			});
			list.appendChild(aElem);
		}
	}
}

AccountList.html = `
	<h1>Accounts</h1>
	<div id="list"></div>
	<a href="javascript:;" id="add" onclick="window.app.router.pushRoute('accounts/add');" class="button">+</button>
	`;

AccountList.style = `
	.AccountList a {
		display:block;
		margin: 1em 0;
		text-align: center;
		text-decoration: none;
		color: var(--fg-light);
	}
	`;
