import { Component } from '../../../../app-ts/src/index';
import { Financio } from '../internal';

/** The delete account page. */
export class DeleteAccount extends Financio.Page {
	/** The name of the account to delete. */
	private name: string;

	constructor(params: Component.Params) {
		super(params);

		// Set the name of the account.
		this.name = this.app.router.getValue('name');

		this.__element('name').innerHTML = this.name;
	}

	private submitForm(): void {
		const formElem = this.__element('form');
		const inputs = Component.getFormInputs(formElem);
		if (inputs.delete === 'DELETE') {
			// Send the command to the server.
			this.app.server.send({
				command: 'delete account',
				name: this.name
			}).then(() => {
				this.app.router.pushQuery({
					page: 'accounts'
				});
			}).catch((error) => {
				this.__element('feedback').innerHTML = error.message;
			});
		}
		else {
			this.__element('feedback').innerHTML = 'Please enter DELETE to delete the account.';
		}
	}
}

DeleteAccount.html = `
	<h1>Delete Account</h1>
	<p>The name of the account to be deleted is <b ref="name"></b>.</p>
	<p>All data associated with the account will be irrecoverably deleted, with no undoing the action.</p>
	<form ref="form" action="javascript:">
		<div class="inputs">
			<p>If you want to delete your account, enter the <b>DELETE</b> in all capital letters:</p>
			<p><input name="delete" type="text" /></p>
		</div>
		<div class="actions">
			<button class="submit" onclick="submitForm">Delete Account</button>
		</div>
		<p ref="feedback"></p>
	</form>
	`;

DeleteAccount.register();
