import { Component } from '../../../../app-js/src/index';
/** @typedef {import('../financio').default} Financio */

/**
 * The delete account page.
 */
export default class DeleteAccount extends Component {
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

		/**
		 * The name of the account to be deleted.
		 * @type {string}
		 * @private
		 */
		this._accountName = this._financio.router.getValue('name');

		// Set the accountName in the text.
		this.setHtmlVariable('accountName', this._accountName);
	}

	async _submitForm(event) {
		const inputs = this.getFormInputs('form');
		if (inputs.delete === 'DELETE') {
			// Send the command to the server.
			try {
				await this._financio.server.send({
					command: 'delete account',
					name: this._accountName
				});
				this._financio.router.pushQuery({
					page: 'accounts'
				});
			}
			catch (error) {
				this.setHtmlVariable('feedback', error.message);
			}
		}
		else {
			this.setHtmlVariable('feedback', 'Please enter DELETE to delete the account.');
		}
	}
}

DeleteAccount.html = `
	<h1>Delete Account</h1>
	<p>The name of the account to be deleted is <b>{{accountName}}</b>.</p>
	<p>All data associated with the account will be irrecoverably deleted, with no undoing the action.</p>
	<form id="form" action="javascript:">
		<p>If you want to delete your account, enter the <b>DELETE</b> in all capital letters:</p>
		<p><input name="delete" type="text" /></p>
		<button class="submit" onclick="_submitForm">Delete Account</button>
		<p>{{feedback}}</p>
	</form>
	`;
