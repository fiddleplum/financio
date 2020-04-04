import { Component } from '../../../../app-ts/src/index';
import { Financio } from '../internal';

/** The list accounts page. */
export class ListAccounts extends Financio.Page {
	constructor(params: Component.Params) {
		super(params);

		// Populate the list of account names.
		this.app.server.send({
			command: 'list accounts'
		}).then((accountNames: string[]) => {
			let html = '';
			for (let i = 0, l = accountNames.length; i < l; i++) {
				html += `<button ref="${accountNames[i]}" onclick="goToViewAccount">${accountNames[i]}</button>`;
			}
			this.__setHtml(this.__element('list'), html);
		});
	}

	/** Goes to the page named in the ref. */
	private goToViewAccount(event: UIEvent): void {
		if (event.target instanceof HTMLElement) {
			const ref = event.target.getAttribute('ref');
			if (ref !== null) {
				this.app.router.pushQuery({
					page: 'viewAccount',
					name: ref
				});
			}
		}
	}

	/** Goes to the add account page. */
	private goToAddAccount(): void {
		this.app.router.pushQuery({
			page: 'addAccount'
		});
	}
}

ListAccounts.html = `
	<h1>Accounts</h1>
	<div ref="list"></div>
	<button ref="newAccount" onclick="goToAddAccount">+ New Account +</button>
	`;

ListAccounts.css = `
	button.ListAccounts, .ListAccounts button {
		display: block;
		margin: 1rem auto;
		width: 10rem;
	}
	`;

ListAccounts.register();
