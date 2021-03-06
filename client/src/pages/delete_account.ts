import { Component } from '../../../../app-ts/src/index';
import { Financio, Account, NiceForm } from '../internal';

/** The delete account page. */
export class DeleteAccount extends Financio.Page {
	/** The id of the account to delete. */
	private _id: string;

	/** The name of the account for verification. */
	private _name: string | undefined;

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
			this._name = account.name;
			this.__element('name').innerHTML = account.name;
			if (account.children !== undefined && account.children.length > 0) {
				this.__element('childMessage').style.display = 'block';
			}

			// (this.__component('niceform') as NiceForm).entries = entries;


		});
	}

	/** Goes to the view account page. */
	private _goToViewAccount(): void {
		this.app.router.pushQuery({
			page: 'viewAccount',
			id: this._id
		});
	}

	private async _submitForm(results: NiceForm.Results): Promise<string | void> {
		if (results.delete === this._name) {
			// Send the command to the server.
			return this.app.server.send({
				command: 'delete account',
				id: this._id
			}).then(() => {
				this.app.router.pushQuery({
					page: 'listAccounts'
				});
			});
		}
		else {
			throw new Error('Please enter the name of the account exactly.');
		}
	}
}

DeleteAccount.html = /*html*/`
	<div>
		<h1>Delete Account</h1>
		<p>The name of the account to be deleted is <b ref="name"></b>.</p>
		<p>All data associated with the account will be irrecoverably deleted, with no undoing the action.</p>
		<p ref="childMessage" style="display: none;">All child accounts will be moved up to the parent of this account.</p>
		<p>If you want to delete your account, enter the name in of the account (case sensitive).</p>
		<NiceForm ref='niceform' submitText="Add Account" onCancel="{{_goToViewAccount}}" onSubmit="{{_submitForm}}">
			<Entry name="delete"></Entry>
		</NiceForm>
	</div>
	`;

DeleteAccount.register();
