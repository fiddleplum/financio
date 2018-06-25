import WS from './ws';

class App {
	static async initialize() {
		this.serverHost = '//localhost:8080';

		this.accountListElem = document.getElementById('account_list');
		this.accountViewElem = document.getElementById('account_view');
		this.messageElem = document.getElementById('message');

		// Start the web socket connection.
		this.ws = new WS(this.serverHost);

		await this.ws.getReadyPromise();

		this.populateAccountList();
	}

	static showMessage(message) {
		document.getElementById('message').innerHTML = message;
	}

	static async populateAccountList() {
		let accounts = await this.ws.send({
			'subject': 'accounts',
			'verb': 'list'
		});
		let html = '<ul>';
		for (let i = 0; i < accounts.length; i++) {
			html += '<li><a href="javascript:viewAccount(\'' + accounts[i] + '\');">' + accounts[i] + '</a> <a href="javascript:if (confirm(\'Delete the account &quot;' + accounts[i] + '&quot;?\')) { deleteAccount(\'' + accounts[i] + '\'); }">DELETE</a></li>';
		}
		html += '</ul>';
		this.accountListElem.innerHTML = html;
	}

	static async createAccount() {
		// Get from the form.
		let name = document.getElementById('create_account_name').value;
		let type = 'credit';
		if (document.getElementById('create_account_type_credit').checked) {
			type = 'credit';
		}
		else if (document.getElementById('create_account_type_debit').checked) {
			type = 'debit';
		}

		// Do the fetch.
		try {
			let res = await fetch(this.serverHost + '/account/create', {
				method: 'post',
				body: JSON.stringify({
					name: name,
					type: type
				})
			});
			let text = await res.text();
			this.showMessage(text);
			await this.populateAccountList();
		}
		catch (err) {
			this.showMessage(err);
		}
	}

	static async deleteAccount(name) {
		// Do the fetch.
		try {
			let res = await fetch(this.serverHost + '/account/delete', {
				method: 'post',
				body: JSON.stringify({
					name: name
				})
			});
			let text = await res.text();
			this.showMessage(text);
			await this.populateAccountList();
		}
		catch (err) {
			this.showMessage(err);
		}
	}

	static async viewAcccount() {
		// Do the fetch.
		try {
			let res = await fetch(this.serverHost + '/account/view', {
				method: 'post',
				body: JSON.stringify({
					name: name
				})
			});
			let text = await res.text();
			this.showMessage(text);
		}
		catch (err) {
			this.showMessage(err);
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	App.initialize();
	console.log('Your application has initialized.');
});

window.App = App;
