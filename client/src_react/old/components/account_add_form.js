import { Component } from '../../../../app-js/src/index';
/** @typedef {import('../index').default} FinancioApp */

export default class AccountAddForm extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 * @param {FinancioApp} app
	 */
	constructor(elem, app) {
		super(elem);

		/**
		 * A reference to the app.
		 * @type {FinancioApp}
		 * @private
		 */
		this._app = app;

		this.elem.querySelector('#createAccountForm #submit').addEventListener('click', this._createAccount.bind(this));
	}

	async _createAccount() {
		// Get data from the form.
		let name = this.elem.querySelector('#createAccountForm #name').value;
		let type = this.elem.querySelector('#createAccountForm #type').value;

		// Send the command to the server.
		try {
			await this._app.ws.send({
				'command': 'create account',
				'name': name,
				'type': type
			});
		}
		catch (errorMessage) {
			this._app.showMessage(errorMessage);
			return;
		}

		// Notify the user of success.
		this._app.showMessage('The account "' + name + '" was created.');

		// Show the newly created account in the account list.
		this._app.query.push({ section: 'accounts' });
	}
}

AccountAddForm.html = `
	<h1>Create an Account</h1>
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
