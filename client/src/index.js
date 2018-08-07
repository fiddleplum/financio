import WS from './ws';

/**
 * The main Financio application.
 */
class App {
	static async initialize() {
		// Connect the web socket to the server host.
		this.ws = new WS(this.serverHost);

		// Notify the user that Financio is connecting.
		this.showMessage('Financio is connecting.');

		// Wait for it to connect.
		await this.ws.getReadyPromise();

		// Notify the user that Financio has connected.
		this.showMessage('Financio is connected.');

		// Populate the list of accounts.
		this.populateAccountList(this.ws, document.querySelector('#createAccountForm'));
	}

	/**
	 * Add a message to show to the user.
	 * @param {string} message
	 */
	static showMessage(message) {
		document.querySelector('#message').innerHTML = message;
	}

	static async populateAccountList() {
		let accounts = await this.ws.send({
			'command': 'list accounts'
		});
		let html = '<ul>';
		for (let i = 0; i < accounts.length; i++) {
			html += '<li><a href="javascript:App.viewAccount(\'' + accounts[i] + '\');">' + accounts[i] + '</a> <a href="javascript:if (confirm(\'Delete the account &quot;' + accounts[i] + '&quot;?\')) { App.deleteAccount(\'' + accounts[i] + '\'); }">DELETE</a></li>';
		}
		html += '</ul>';
		document.querySelector('#account_list').innerHTML = html;
	}

	static async createAccount() {
		// Get data from the form.
		let name = document.querySelector('#create_account_name').value;
		let type = 'credit';
		if (document.querySelector('#create_account_type_credit').checked) {
			type = 'credit';
		}
		else if (document.querySelector('#create_account_type_debit').checked) {
			type = 'debit';
		}

		// Send the command to the server.
		await this.ws.send({
			'command': 'create account',
			'name': name,
			'type': type
		});

		// Notify the user of success.
		this.showMessage('The account "' + name + '" was created.');

		// Repopulate the account list.
		await this.populateAccountList();
	}

	static async deleteAccount(name) {
		await this.ws.send({
			'command': 'delete account',
			'name': name
		});

		// Notify the user of success.
		this.showMessage('The account "' + name + '" was deleted.');

		// Repopulate the account list.
		await this.populateAccountList();
	}

	static async viewAccount(name) {
		let accountInfo = await this.ws.send({
			'command': 'get account info',
			'name': name
		});

		let html = '<h1>' + name + '</h1>';
		html += '<h2>' + accountInfo.type + '</h2>';

		document.querySelector('#account_view').innerHTML = html;
	}
}

/**
 * This is the web socket host url.
 * @type {string}
 * @private
 */
App.serverHost = '//localhost:8080';

/**
 * The web socket.
 * @type {WebSocket}
 * @private
 */
App.ws = null;

document.addEventListener('DOMContentLoaded', () => {
	window.App = App;

	App.initialize();
});

export default App;
