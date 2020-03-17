import { Component } from '../../../../app-js/src/index';
/** @typedef {import('../financio').default} Financio */

/**
 * The add account page.
 */
export default class AddAccount extends Component {
	/**
	 * Constructor.
	 * @param {Component.Params} params
	 */
	constructor(params) {
		super(params);

		/**
		 * The app.
		 * @type {Financio}
		 * @private
		 */
		this._app = params.attributes.get('app');
	}

	/**
	 * The click event handler for the menu buttons.
	 * @param {Element} element
	 * @param {UIEvent} event
	 * @private
	 */
	_goToListCategories(element, event) {
		this._app.router.pushQuery({
			page: 'listAccounts'
		});
	}

	async _submitForm() {
		const inputs = Component.getFormInputs(this.__element('form'));
		// Send the command to the server.
		try {
			await this._app.server.send({
				command: 'create account',
				name: inputs.name,
				type: inputs.type
			});
			this._app.router.pushQuery({
				page: 'listAccounts'
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
			<button class="submit" onclick="_submitForm">Add Account</button>
			<button class="cancel" onclick="_goToListCategories">Cancel</button>
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
