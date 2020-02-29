import { Component } from '../../../../app-js/src/index';
/** @typedef {import('../financio').default} Financio */

/**
 * The add account page.
 */
export default class AddAccount extends Component {
	/**
	 * Constructs the app.
	 * @param {HTMLElement} elem - The element inside which the component will reside.
	 * @param {Financio} financio - The app.
	 */
	constructor(elem, financio) {
		super(elem);

		/**
		 * The app.
		 * @type {Financio}
		 * @private
		 */
		this._financio = financio;
	}

	async _submitForm(event) {
		const inputs = this.getFormInputs('form');
		// Send the command to the server.
		try {
			await this._financio.server.send({
				command: 'create account',
				name: inputs.name,
				type: inputs.type
			});
			this._financio.router.pushQuery({
				page: 'accounts'
			});
		}
		catch (error) {
			this.setHtmlVariable('feedback', error.message);
		}
	}
}

AddAccount.html = `
	<h1>Add an Account</h1>
	<form id="form" action="javascript:">
		<label for="name" class="left">Name:</label>
		<input name="name" type="text" class="right" />
		<label for="type" class="left">Type:</label>
		<select name="type" class="right">
			<option value="credit">Credit</option>
			<option value="debit">Debit</option>
		</select>
		<button class="submit" onclick="_submitForm">Add Account</button>
		<div id="feedback">{{feedback}}</div>
	</form>
`;

AddAccount.style = `
	.AddAccount form #name {
		width: 10rem;
	}

	.AddAccount form #type {
		width: 6rem;
	}
	`;

Component.register(AddAccount);
