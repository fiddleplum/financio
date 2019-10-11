import { Component } from '../../../../app-js/src/index';
import './add_account.css';
/** @typedef {import('../financio').default} Financio */

/**
 * The add account page.
 */
export default class AddAccount extends Component {
	/**
	 * Constructs the app.
	 * @param {HTMLElement} elem - The element inside which thee the component will reside.
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

		this.on('submit', 'click', this._submitForm);
	}

	async _submitForm(event) {
		// Send the command to the server.
		try {
			await this._financio.server.send({
				command: 'create account',
				name: this.elem.querySelector('#name').value,
				type: this.elem.querySelector('#type').value
			});
			this._financio.router.push({
				page: 'accounts'
			});
		}
		catch (errorMessage) {
			this.elem.querySelector('#feedback').innerHTML = errorMessage;
		}
	}
}

AddAccount.html = `
	<h1>Add an Account</h1>
	<form action="javascript:">
		<label for="name" class="left">Name:</label>
		<input id="name" name="name" type="text" class="right" />
		<label for="type" class="left">Type:</label>
		<select id="type" name="type" class="right">
			<option value="credit">Credit</option>
			<option value="debit">Debit</option>
		</select>
		<button id="submit" class="submit">Add Account</button>
		<div id="feedback"></div>
	</form>
	`;
