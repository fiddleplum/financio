import { Component } from '../../../../app-ts/src/index';
import { Financio, Account, NiceForm } from '../internal';

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
	private _goToViewAccount(): void {
		this.app.router.pushQuery({
			page: 'viewAccount',
			id: this._id
		});
	}

	private async _submitForm(results: NiceForm.Results) {
		// Send the command to the server.
		return this.app.server.send({
			command: 'rename account',
			id: this._id,
			newName: results.newName
		}).then(() => {
			this.app.router.pushQuery({
				page: 'viewAccount',
				id: this._id
			});
		});
	}
}

RenameAccount.html = `
	<div>
		<h1>Rename Account</h1>
		<p>The name of the account to be renamed is <b ref="name"></b>.</p>
		<NiceForm submitText="Rename Account" onCancel="{{_goToViewAccount}}" onSubmit="{{_submitForm}}">
			<Entry name="newName">New name</Entry>
		</NiceForm>
		<p ref="feedback"></p>
	</div>
	`;

RenameAccount.css = `
	`;

RenameAccount.register();
