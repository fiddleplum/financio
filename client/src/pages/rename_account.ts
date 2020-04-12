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

	/** Goes to the view account page. */
	private goToViewAccount(): void {
		this.app.router.pushQuery({
			page: 'viewAccount',
			name: this.name
		});
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
	<div>
		<h1>Rename Account</h1>
		<p>The name of the account to be renamed is <b ref="name"></b>.</p>
		<form ref="form" action="javascript:">
			<p class="label"><label for="name">New name:</label></p>
			<p><input name="newName" type="text" /></p>
			<button class="left" onclick="goToViewAccount">Cancel</button>
			<button class="right" onclick="submitForm">Rename Account</button>
		</form>
		<p ref="feedback"></p>
	</div>
	`;

RenameAccount.css = `
	.RenameAccount form .left {
		width: 7rem;
	}

	.RenameAccount form .right {
		width: 10rem;
	}
	`;

RenameAccount.register();
