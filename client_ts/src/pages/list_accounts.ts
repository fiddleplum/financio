import { Component } from '../../../../app-ts/src/index';
import { Financio, Account } from '../internal';

/** The list accounts page. */
export class ListAccounts extends Financio.Page {
	constructor(params: Component.Params) {
		super(params);

		// Populate the list of account names.
		this.app.server.send({
			command: 'list accounts'
		}).then((accounts: Account[]) => {
			let html = '';
			for (let i = 0, l = accounts.length; i < l; i++) {
				html += `<button ref="${accounts[i].name}" onclick="goToViewAccount">${accounts[i].name}</button>`;
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
	<div>
		<h1>Accounts</h1>
		<div ref="list"></div>
		<button ref="newAccount" onclick="goToAddAccount">+ New Account +</button>
	</div>
	`;

ListAccounts.css = `
	.ListAccounts button {
		display: block;
		margin: 1rem auto;
		width: 10rem;
	}
	`;

ListAccounts.register();
