import { Component } from '../../../../app-js/src/index';
import html from './rename_account.html';
import css from './rename_account.css';
/** @typedef {import('../financio').default} Financio */

/**
 * The rename account page.
 */
export default class RenameAccount extends Component {
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

		/**
		 * The name of the account to be renamed.
		 * @type {string}
		 * @private
		 */
		this._accountName = this._financio.router.getValue('name');

		this.setHtmlVariable('accountName', this._accountName);
	}

	async _submitForm(event) {
		const inputs = this.getFormInputs('form');
		// Send the command to the server.
		try {
			await this._financio.server.send({
				command: 'rename account',
				name: this._accountName,
				newName: inputs.newName
			});
			this._financio.router.pushQuery({
				page: 'viewAccount',
				name: inputs.newName
			});
		}
		catch (error) {
			this.setHtmlVariable('feedback', error.message);
		}
	}
}

RenameAccount.register();
