import { Component, ShowHide } from '../../../../app-ts/src/index';
import { Financio, Account } from '../internal';

/** The view accounts page. */
export class ViewAccount extends Financio.Page {
	/** The id of the account to view. */
	private _id: string;

	constructor(params: Component.Params) {
		super(params);

		// Set the name of the account.
		this._id = this.app.router.getValue('id');

		// Get the info on the account.
		this.app.server.send({
			command: 'list accounts'
		}).then((accounts: Account[]) => {
			const account = Account.getById(accounts, this._id);
			this._populateAccountInfo(account);
		});
	}

	private _populateAccountInfo(account: Account | undefined): void {
		if (account === undefined) {
			this.app.message = 'The account could not be found.';
			this.__element('accountName').innerHTML = 'Unknown';
			return;
		}
		this.__element('accountName').innerHTML = account.name;
		if (account.children !== undefined) { // A group account.
			this.__element('accountInfo').innerHTML = '<p>This is a group account.</p>';
		}
	}

	private _toggleMenu(): void {
		ShowHide.toggle(this.__element('menu'));
	}

	private _goToListAccounts(): void {
		this.app.router.pushQuery({
			page: 'listAccounts'
		});
	}

	private _goToRenameAccount(): void {
		this.app.router.pushQuery({
			page: 'renameAccount',
			id: this._id
		});
	}

	private _goToDeleteAccount(): void {
		this.app.router.pushQuery({
			page: 'deleteAccount',
			id: this._id
		});
	}
}

ViewAccount.html = /*html*/`
	<div>
		<h1 ref="accountName"></h1>
		<button ref="menuButton" onclick="{{_toggleMenu}}"><icon src="assets/svgs/menu.svg"/></button>
		<div ref="menu" style="display: none;">
			<p><button onclick="{{_goToListAccounts}}">Accounts</button></p>
			<p><button onclick="{{_goToRenameAccount}}">Rename</button></p>
			<p><button onclick="{{_goToDeleteAccount}}">Delete</button></p>
		</div>
		<div ref="accountInfo"></div>
	</div>
	`;

ViewAccount.css = /*css*/`
	.ViewAccount [ref="menuButton"] {
		position: absolute;
		top: 0;
		right: 0;
		font-size: 1.5rem;
	}
	.ViewAccount [ref="menu"] {
		position: absolute;
		top: 1.5rem;
		right: 0;
		border: 1px solid var(--fg-light);
		border-radius: 0 0 .25rem .25rem;
		text-align: right;
	}
	.ViewAccount .toolbar {
		float: right;
		font-size: 1rem;
		line-height: 2rem;
		height: 2rem;
	}
	`;

ViewAccount.register();
