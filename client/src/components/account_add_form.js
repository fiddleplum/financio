import { Component } from '@fiddleplum/app-js'

class AccountAddForm extends Component {
	constructor(gridArea) {
		super(gridArea);
		this.__div.innerHTML = `
			<div class="page_title">Create an Account</div>
			<form id="createAccountForm" action="javascript:void(null);">
					<label for="name">Name:</label>
					<input type="text" id="name" />
					<label for="type">Type:</label>
					<select id="type">
						<option value="credit">Credit</option>
						<option value="debit">Debit</option>
					</select>
					<input type="submit" id="submit" class="button" value="Add Account" />
			</form>
			`;
		this.__div.querySelector('#createAccountForm #submit').addEventListener('click', this._createAccount.bind(this));
	}

	async _createAccount() {
		// Get data from the form.
		let name = this.__div.querySelector('#createAccountForm #name').value;
		let type = this.__div.querySelector('#createAccountForm #type').value;

		// Send the command to the server.
		try {
			await window.financio.ws.send({
				'command': 'create account',
				'name': name,
				'type': type
			});
		}
		catch (errorMessage) {
			window.financio.showMessage(errorMessage);
			return;
		}

		// Notify the user of success.
		window.financio.showMessage('The account "' + name + '" was created.');

		// Show the newly created account in the account list.
		window.financio.router.pushRoute('accounts');
	}
}

export default AccountAddForm;
