import { Component } from '../../../../app-ts/src/index';
import { Financio, Account, NiceForm } from '../internal';

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
			const entries: NiceForm.Entry[] = [];
			
			entries.push(new NiceForm.Entry('name', 'Name', 'text'));
			entries.push(new NiceForm.Entry('group', 'Group', 'choice', [
				new NiceForm.Option('no', 'No'),
				new NiceForm.Option('yes', 'Yes')]));
			entries.push(new NiceForm.Entry('currency', 'Currency', 'text', undefined, 'Write a currency in the format "singular/plural". For example, you can write "dollar/dollars", "share/shares", or "house/houses".'));
			entries.push(new NiceForm.Entry('placement', 'Insert before', 'choice', this._populatePlacement(accounts)));

			(this.__component('niceform') as NiceForm).entries = entries;

			// this.__element('placement').innerHTML = this._populatePlacement(accounts);

		}).catch((error) => {
			throw new Error('While loading AddAccounts: ' + error);
		});
	}

	private _populatePlacement(accounts: Account[], parent: Account | undefined = undefined, depth: number = 0): NiceForm.Option[] {
		const spacing = '&#x2001;'.repeat(depth);
		const optionList: NiceForm.Option[] = [];
		// let html = ``;
		for (let i = 0; i < accounts.length; i++) {
			const  account = accounts[i];
			optionList.push(new NiceForm.Option(account.id, spacing + account.name));
			// html += `<option style="text-indent: ${depth}em" value="${account.id}">${spacing}${account.name}</option>`;
			if (account.children !== undefined) {
				optionList.push(...this._populatePlacement(account.children, account, depth + 1));
				// html += this._populatePlacement(account.children, account, depth + 1);
			}
		}
		if (parent !== undefined) {
			optionList.push(new NiceForm.Option('end_of_' + parent.id, `${spacing}*end of ${parent.name}*`));
			// html += `<option style="text-indent: ${depth}em" value="end_of_${parent.id}">${spacing}*end of ${parent.name}*</option>`;
		}
		else {
			optionList.push(new NiceForm.Option('end_of_', `${spacing}*end*`));
			// html += `<option style="text-indent: ${depth}em" value="end_of_">${spacing}*end*</option>`;
		}
		// return html;
		return optionList;
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

	private async _submitForm(results: NiceForm.Results) {
		// Send the command to the server.
		try {
			await this.app.server.send({
				command: 'create account',
				name: results.name,
				isGroup: results.group === 'yes',
				currency: results.currency,
				placement: results.placement });
		}
		catch (error) {
			return error.message;
		}

		// Go to the list accounts page.
		this.app.router.pushQuery({
			page: 'listAccounts'
		});
	}
}

AddAccount.html = /*html*/`
	<div>
		<h1>Add an Account</h1>
		<NiceForm ref='niceform' submitText="Add Account" onCancel="{{_goToListCategories}}" onSubmit="{{_submitForm}}"></NiceForm>
	</div>
	`;

AddAccount.css = /*css*/`
	.AddAccount form #name {
		max-width: 10rem;
	}

	.AddAccount form #currency {
		max-width: 10rem;
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
	`;

AddAccount.register();
