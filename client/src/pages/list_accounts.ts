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
			const html = this.listAccounts(accounts, 0);
			this.__setHtml(this.__element('list'), html);
		});
	}

	private listAccounts(accounts: Account[], depth: number): string {
		let html = '';
		for (let i = 0, l = accounts.length; i < l; i++) {
			const account = accounts[i];
			if (account.children !== undefined) {
				html += `<h2 style="margin-left: ${depth}em">${accounts[i].name}</h2>`;
				html += this.listAccounts(account.children, depth + 1);
			}
			else {
				html += `<h2 style="margin-left: ${depth}em"><a ref="${accounts[i].id}" onclick="{{goToViewAccount}}">${accounts[i].name}</a> &rarr;</h2>`;
			}
		}
		return html;
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
		<button ref="newAccount" onclick="{{goToAddAccount}}"><icon src="svg/add.svg"/></button>
	</div>
	`;

ListAccounts.css = /*css*/`
		
	.ListAccounts button {
	}
	.ListAccounts .list {
		widdth: 20rem;
		font-size: 1.5rem;
	}
	`;

ListAccounts.register();
