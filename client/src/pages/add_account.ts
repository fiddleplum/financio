import { Component } from '../../../../app-ts/src/index';
import { Financio, Account } from '../internal';

/** The add account page. */
export class AddAccount extends Financio.Page {
	private _accounts: Account[] = [];

	constructor(params: Component.Params) {
		super(params);

		// Populate the list of account names.
		this.app.server.send({
			command: 'list accounts'
		}).then((accounts: Account[]) => {
			this._accounts = accounts;
			this.__element('placement').innerHTML = this._populatePlacement(accounts);
		});
	}

	private _populatePlacement(accounts: Account[], parent: Account | undefined = undefined, depth: number = 0): string {
		const spacing = '&#x2001;'.repeat(depth);
		let html = ``;
		for (let i = 0; i < accounts.length; i++) {
			const  account = accounts[i];
			html += `<option style="text-indent: ${depth}em" value="${account.id}">${spacing}${account.name}</option>`;
			if (account.children !== undefined) {
				html += this._populatePlacement(account.children, account, depth + 1);
			}
		}
		if (parent !== undefined) {
			html += `<option style="text-indent: ${depth}em" value="end_of_${parent.id}">${spacing}*end of ${parent.name}*</option>`;
		}
		else {
			html += `<option style="text-indent: ${depth}em" value="end_of_">${spacing}*end*</option>`;
		}
		return html;
	}

	private _onGroupChange() {
		const group = (this.__element('group') as HTMLSelectElement).value === 'yes';
	}

	private _goToListCategories(): void {
		this.app.router.pushQuery({
			page: 'listAccounts'
		});
	}

	private _showFeedback(message: string): void {
		const feedbackElem = this.__element('feedback');
		feedbackElem.innerHTML = message;
		feedbackElem.style.opacity = '1';
	}

	private _showCurrencyHelp(): void {
		this._showFeedback('Write a currency in the format "singular/plural". For example, you can write "dollar/dollars", "share/shares", or "house/houses".');
	}

	private _submitForm(): void {
		const inputs = Component.getFormInputs(this.__element('form'));
		console.log(inputs);
		// Send the command to the server.
		this.app.server.send({
			command: 'create account',
			name: inputs.name,
			isGroup: inputs.group === 'yes',
			currency: inputs.currency,
			placement: inputs.placement
		}).then(() => {
			this.app.router.pushQuery({
				page: 'listAccounts'
			});
		}).catch((error) => {
			this._showFeedback(error.message);
		});
	}
}

AddAccount.html = /*html*/`
	<div>
		<h1>Add an Account</h1>
		<form ref="form" action="javascript:">
			<div class="input">
				<label for="name">Name:</label>
				<input name="name" id="name" type="text" />
			</div>
			<div class="input">
				<label for="group">Group:</label>
				<select name="group" id="group">
					<option value="no">No</option>
					<option value="yes">Yes</option>
				</select>
			</div>
			<div class="input">
				<label for="currency">Currency: <a href="javascript:" class="circled" onclick="{{_showCurrencyHelp}}">?</a></label>
				<input name="currency" id="currency" type="text" />
			</div>
			<div class="input">
				<label for="placement">Insert before:</label>
				<select name="placement" id="placement" ref="placement"></select>
			</div>
			<div>
				<button class="right" onclick="{{_submitForm}}">Add Account</button>
				<button class="left" onclick="{{_goToListCategories}}">Cancel</button>
			</div>
		</form>
		<div ref="feedback"></div>
	</div>
	`;

AddAccount.css = /*css*/`
	.AddAccount form #name {
		max-width: 10rem;
	}

	.AddAccount form #currency {
		max-width: 5rem;
	}

	.AddAccount form #type {
		max-width: 6rem;
	}

	.AddAccount .circled {
		display: inline-block;
		width: calc(1.66em - 1px);
		height: calc(1.66em - 1px);
		border: 1px solid var(--fg-light);
		border-radius: 1em;
		font-size: .75em;
		text-align: center;
	}

	.AddAccount [ref="feedback"] {
		opacity: 0;
		transition: opacity .25s;
	}
	`;

AddAccount.register();
