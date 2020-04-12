import { Component } from '../../../../app-ts/src/index';
import { Financio } from '../internal';

/** The add account page. */
export class AddAccount extends Financio.Page {
	private _goToListCategories(): void {
		this.app.router.pushQuery({
			page: 'listAccounts'
		});
	}

	private _submitForm(): void {
		const inputs = Component.getFormInputs(this.__element('form'));
		// Send the command to the server.
		this.app.server.send({
			command: 'create account',
			name: inputs.name,
			type: inputs.type
		}).then(() => {
			this.app.router.pushQuery({
				page: 'listAccounts'
			});
		}).catch((error) => {
			this.__element('feedback').innerHTML = error.message;
		});
	}
}

AddAccount.html = /*html*/`
	<div>
		<h1>Add an Account</h1>
		<form ref="form" action="javascript:">
			<p class="label"><label for="name">Name:</label></p>
			<p><input name="name" type="text" /></p>
			<p class="label"><label for="type">Type:</label></p>
			<p><select name="type">
				<option value="credit">Credit</option>
				<option value="debit">Debit</option>
			</select></p>
			<button class="left" onclick="{{_goToListCategories}}">Cancel</button>
			<button class="right" onclick="{{_submitForm}}">Add Account</button>
		</form>
		<div ref="feedback"></div>
	</div>
	`;

AddAccount.css = /*css*/`
	.AddAccount form #name {
		width: 10rem;
	}

	.AddAccount form #type {
		width: 6rem;
	}
	`;

AddAccount.register();
