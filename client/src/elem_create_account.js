import Util from './util';

/** @typedef {import('./ws').default} WS */

class ElemCreateAccount extends HTMLElement {
	connectedCallback() {
		this.innerHTML = `
			<style>
				elem-create-account label {
					display: inline-block;
					color: black;
					width: 4em;
				}
				elem-create-account input[type=text], select {
					display: inline-block;
					color: black;
					width: calc(100% - 6em);
				}
				elem-create-account input[type=submit] {
					color: black;
					width: 100%;
				}
			</style>
			<form id="createAccountForm" action="javascript:void(null);">
				<div class="title">Create an Account</div>
				<label for="name">Name:</label>
				<input type="text" id="name" />
				<label for="type">Type:</label>
				<select id="type">
					<option value="credit">Credit</option>
					<option value="debit">Debit</option>
				</select>
				<input type="submit" id="submit" value="Add Account" />
			</form>`;

		this.querySelector('#createAccountForm #submit').addEventListener('click', this.createAccount.bind(this));
	}

	async createAccount() {
		// Get data from the form.
		let name = this.querySelector('#createAccountForm #name').value;
		let type = this.querySelector('#createAccountForm #type').value;

		window.app.createAccount(name, type);
	}
}

window.customElements.define('elem-create-account', ElemCreateAccount);

export default ElemCreateAccount;
