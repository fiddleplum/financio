import { Component } from '../../../../app-ts/src/index';
import { Financio } from '../internal';

/** The view accounts page. */
export class ViewAccount extends Financio.Page {
	/** The name of the account to view. */
	private name: string;

	constructor(params: Component.Params) {
		super(params);

		// Set the name of the account.
		this.name = this.app.router.getValue('name');

		this.__element('accountName').innerHTML = this.name;
	}

	private goToListAccounts(): void {
		this.app.router.pushQuery({
			page: 'listAccounts'
		});
	}

	private goToRenameAccount(): void {
		this.app.router.pushQuery({
			page: 'renameAccount',
			name: this.name
		});
	}

	private goToDeleteAccount(): void {
		this.app.router.pushQuery({
			page: 'deleteAccount',
			name: this.name
		});
	}
}

ViewAccount.html = /*html*/`
	<div>
		<div class="toolbar">
			<button onclick="{{goToListAccounts}}">Accounts</button> <button ref="renameAccount" onclick="{{goToRenameAccount}}"><icon src="svg/edit.svg"/></button> <button ref="deleteAccount" onclick="{{goToDeleteAccount}}"><icon src="svg/trash.svg"/></button>
		</div>
		<h1 ref="accountName"></h1>
		<TransactionList></TransactionList>
	</div>
	`;

ViewAccount.css = /*css*/`
	.ViewAccount .toolbar {
		float: right;
		font-size: 1rem;
		line-height: 2rem;
		height: 2rem;
	}
	`;

ViewAccount.register();