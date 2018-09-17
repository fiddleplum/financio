class ElemAccountList extends HTMLElement {
	constructor() {
		super();

		this._ws = null;

		this._root = this.attachShadow({mode: 'open'});
	}

	initialize(ws, messageElement) {
		this._ws = ws;
		this._messageElement = messageElement;
		this.update();
	}

	async update() {
		if (this._ws !== null) {
			let accounts = await this._ws.send({
				'command': 'list accounts'
			});

			let html = `
				<style>
					* {
						margin: 0;
					}

					#root {
						padding: .25em;
						height: 1.5em;
						background: grey;
					}

					a {
						display: inline-block;
						background: lightgrey;
						line-height: 1em;
						padding: .25em;
						text-align: center;
						text-decoration: none;
						color: black;
					}

					#createAccountButton {
						width: 1em;
					}

					#createAccountForm {
						display: none;
					}
				</style>
				<div id="root">
					<span>Accounts:</span>`;
			for (let i = 0; i < accounts.length; i++) {
				html += `
					<a href="javascript:App.viewAccount('` + accounts[i] + `');">` + accounts[i] + `</a>`;
			}
			html += `
					<a id="createAccountButton" href="javascript:false">+</a>
					<form id="createAccountForm" action="javascript:void(null);">
						<div>Create an account: <input type="text" id="create_account_name" /></div>
						<div>Debt/Credit: <input type="radio" value="credit" name="type" id="create_account_type_credit" /></div>
						<div>Asset/Debit: <input type="radio" value="debit" name="type" id="create_account_type_debit" /></div>
						<div><input type="submit" onclick="App.createAccount();" /></div>
					</form>
				</div>`;
			this._root.innerHTML = html;
			this._root.querySelector('#createAccountButton').addEventListener('click', (event) => {
				let createAccountForm = this._root.querySelector('#createAccountForm');
				if (createAccountForm.style.display !== 'block') {
					createAccountForm.style.display = 'block';
				}
				else {
					createAccountForm.style.display = 'none';
				}
			});
			// <a href="javascript:if (confirm('Delete the account &quot;` + accounts[i] + `&quot;?')) { App.deleteAccount('` + accounts[i] + `'); }">DELETE</a>
		}
	}

	async createAccount() {
		// Get data from the form.
		let name = this._root.querySelector('#create_account_name').value;
		let type = 'credit';
		if (this._root.querySelector('#create_account_type_credit').checked) {
			type = 'credit';
		}
		else if (this._root.querySelector('#create_account_type_debit').checked) {
			type = 'debit';
		}

		// Send the command to the server.
		await this._ws.send({
			'command': 'create account',
			'name': name,
			'type': type
		});

		// Notify the user of success.
		this._messageElement.addMessage('The account "' + name + '" was created.');

		// Repopulate the account list.
		await this.populateAccountList();
	}
}

window.customElements.define('elem-account-list', ElemAccountList);

export default ElemAccountList;
