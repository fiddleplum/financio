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

		// const transactionList = this.__component('transactionList');
		// if (transactionList instanceof TransactionList) {
		// }
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

ViewAccount.html = `
	<div>
		<div class="toolbar">
			<button onclick="goToListAccounts">Back</button> <button ref="renameAccount" onclick="goToRenameAccount"><icon src="svg/edit.svg"/></button> <button ref="deleteAccount" onclick="goToDeleteAccount"><icon src="svg/trash.svg"/></button>
		</div>
		<h1 ref="accountName"></h1>
		<!--<datechooser/>-->
		<!--<div ref="transactionList"></div>-->
	</div>
	`;

ViewAccount.css = `
	.ViewAccount .toolbar {
		float: right;
		font-size: 1rem;
		line-height: 2rem;
		height: 2rem;
	}
	`;

ViewAccount.register();
