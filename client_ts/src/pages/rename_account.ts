import { Component } from '../../../../app-ts/src/index';
import { Financio } from '../internal';

/** The rename account page. */
export class RenameAccount extends Financio.Page {
	/** The name of the account to rename. */
	private name: string;

	constructor(params: Component.Params) {
		super(params);

		// Set the name of the account.
		this.name = this.app.router.getValue('name');

		this.__element('name').innerHTML = this.name;
	}

	private submitForm(): void {
		const formElem = this.__element('form');
		const inputs = Component.getFormInputs(formElem);
		// Send the command to the server.
		this.app.server.send({
			command: 'rename account',
			name: this.name,
			newName: inputs.newName
		}).then(() => {
			this.app.router.pushQuery({
				page: 'viewAccount',
				name: inputs.newName as string
			});
		}).catch((error) => {
			this.__element('feedback').innerHTML = error.message;
		});
	}
}

RenameAccount.html = `
	<h1>Rename Account</h1>
	<p>The name of the account to be renamed is <b ref="name"></b>.</p>
	<form ref="form" action="javascript:">
		<div class="inputs">
			<label for="name" class="left">New name:</label>
			<input name="newName" type="text" class="right" />
		</div>
		<div class="actions">
			<button class="submit" onclick="submitForm">Rename Account</button>
		</div>
		<p ref="feedback"></p>
	</form>
	`;

RenameAccount.css = `
	form.RenameAccount .left {
		width: 7rem;
	}

	form.RenameAccount .right {
		width: 10rem;
	}
	`;

RenameAccount.register();
