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
			const html = Account.surroundByText(accounts, (account: Account, depth: number) => {
				if (account.children !== undefined) {
					return `<h2 style="margin-left: ${depth}em">${account.name}</h2>`;
				}
				else {
					return `<h2 style="margin-left: ${depth}em"><a ref="${account.id}" onclick="{{goToViewAccount}}">${account.name}</a> &rarr;</h2>`;
				}
			});
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

ListAccounts.html = /*html*/`
	<div>
		<h1>Accounts</h1>
		<div ref="list"></div>
		<p><a ref="newAccount" onclick="{{goToAddAccount}}">Add</a></p>
	</div>
	`;

ListAccounts.css = /*css*/`
		
	.ListAccounts button {
	}
	.ListAccounts [ref="newAccount"] {
		font-size: 1.25rem;
	}
	.ListAccounts [ref="list"] {
		font-size: 1.5rem;
		border-bottom: 1px solid var(--fg-light);
		margin-bottom: 1rem;
	}
	`;

ListAccounts.register();
