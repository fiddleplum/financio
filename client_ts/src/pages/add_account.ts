import { Component } from '../../../../app-ts/src/index';
import { Financio } from '../internal';

/** The add account page. */
export class AddAccount extends Financio.Page {
	private goToListCategories(): void {
		this.app.router.pushQuery({
			page: 'listAccounts'
		});
	}

	private submitForm(): void {
		const inputs = Component.getFormInputs(this.__element('form'));
		// Send the command to the server.
		try {
			this.app.server.send({
				command: 'create account',
				name: inputs.name,
				type: inputs.type
			}).then(() => {
				this.app.router.pushQuery({
					page: 'listAccounts'
				});
			});
		}
		catch (error) {
			this.__element('feedback').innerHTML = error.message;
		}
	}
}

AddAccount.html = `
	<h1>Add an Account</h1>
	<form ref="form" action="javascript:">
		<div class="inputs">
			<label for="name" class="left">Name:</label>
			<input name="name" type="text" class="right" />
			<label for="type" class="left">Type:</label>
			<select name="type" class="right">
				<option value="credit">Credit</option>
				<option value="debit">Debit</option>
			</select>
		</div>
		<div class="actions">
			<button class="submit" onclick="submitForm">Add Account</button>
			<button class="cancel" onclick="goToListCategories">Cancel</button>
		</div>
	</form>
	<div ref="feedback"></div>
	`;

AddAccount.css = `
	.AddAccount form #name {
		width: 10rem;
	}

	.AddAccount form #type {
		width: 6rem;
	}
	`;

AddAccount.register();
