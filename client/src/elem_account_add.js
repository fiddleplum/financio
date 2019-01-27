import Data from './data';
/** @typedef {import('./index').default} FinancioApp */
/** @typedef {import('./ws').default} WS */

class ElemAccountAdd {
	constructor(div) {
		div.innerHTML = `
			<style>
				elem-account-add form {
				}

				elem-account-add label {
					display: block;
					width: 100%;
					margin-bottom: .25em;
				}
				elem-account-add input[type=text], select {
					display: block;
					width: 100%;
					margin-bottom: 1em;
				}
			</style>
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
		this.querySelector('#createAccountForm #submit').addEventListener('click', this._createAccount.bind(this));
	}

	async _createAccount() {
		// Get data from the form.
		let name = this.querySelector('#createAccountForm #name').value;
		let type = this.querySelector('#createAccountForm #type').value;

		// Send the command to the server.
		try {
			await Data.createAccount(name, type);
		}
		catch (errorMessage) {
			window.app.showMessage(errorMessage);
			return;
		}

		// Notify the user of success.
		this.showMessage('The account "' + name + '" was created.');

		// Show the newly created account in the account list.
		window.app.showPage('accounts');
	}
}

window.customElements.define('elem-account-add', ElemAccountAdd);

export default ElemAccountAdd;
