import { Component } from '../../../../app-ts/src/index';
import { Financio, Account } from '../internal';

/** The rename account page. */
export class RenameAccount extends Financio.Page {
	/** The name of the account to rename. */
	private _id: string;

	constructor(params: Component.Params) {
		super(params);

		// Set the name of the account.
		this._id = this.app.router.getValue('id') || '';

		// Get the info on the account.
		this.app.server.send({
			command: 'list accounts'
		}).then((accounts: Account[]) => {
			const account = Account.getById(accounts, this._id);
			if (account === undefined) {
				this.app.message('The account could not be found.');
				this.__element('name').innerHTML = 'Unknown';
				return;
			}
			this.__element('name').innerHTML = account.name;
		});
	}

	/** Goes to the view account page. */
	private goToViewAccount(): void {
		this.app.router.pushQuery({
			page: 'viewAccount',
			id: this._id
		});
	}

	private submitForm(): void {
		const formElem = this.__element('form');
		const inputs = Component.getFormInputs(formElem);
		// Send the command to the server.
		this.app.server.send({
			command: 'rename account',
			id: this._id,
			newName: inputs.newName
		}).then(() => {
			this.app.router.pushQuery({
				page: 'viewAccount',
				id: this._id
			});
		}).catch((error) => {
			this.__element('feedback').innerHTML = error.message;
		});
	}
}

RenameAccount.html = `
	<div>
		<h1>Rename Account</h1>
		<p>The name of the account to be renamed is <b ref="name"></b>.</p>
		<form ref="form" action="javascript:">
			<div class="input">
				<label for="newName">New name:</label>
				<input id="newName" name="newName" type="text" />
			</div>
			<div class="buttons">
				<button class="left" onclick="{{goToViewAccount}}">Cancel</button>
				<button class="right" onclick="{{submitForm}}">Rename Account</button>
			</div>
		</form>
		<p ref="feedback"></p>
	</div>
	`;

RenameAccount.css = `
	`;

RenameAccount.register();
