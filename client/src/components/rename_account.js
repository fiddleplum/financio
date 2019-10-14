import { Component } from '../../../../app-js/src/index';
import style from './rename_account.css';
/** @typedef {import('../financio').default} Financio */

/**
 * The rename account page.
 */
export default class RenameAccount extends Component {
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
		 * The name of the account to be renamed.
		 * @type {string}
		 * @private
		 */
		this._accountName = this._financio.router.getValueOf('name');

		this.setRenderState('accountName', this._accountName);

		// Register event handlers.
		this.on('submitButton', 'click', this.submitForm);
	}

	async submitForm(event) {
		const newName = this.get('newName').value;
		// Send the command to the server.
		try {
			await this._financio.server.send({
				command: 'rename account',
				name: this._accountName,
				newName: newName
			});
			this._financio.router.push({
				page: 'viewAccount',
				name: newName
			});
		}
		catch (error) {
			this.setRenderState('feedback', error.message);
		}
	}
}

RenameAccount.html = `
	<h1>Rename Account</h1>
	<p>The name of the account to be renamed is <b>{{accountName}}</b>.</p>
	<form action="javascript:">
		<label for="name" class="left">New name:</label>
		<input id="newName" name="newName" type="text" class="right" />
		<button id="submitButton" class="submit">Rename Account</button>
		<p>{{feedback}}</p>
	</form>
	`;

RenameAccount.style = style;
