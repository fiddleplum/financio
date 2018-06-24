class App {
	static initialize() {
		this.serverHost = '//localhost:8080';

		this.accountListElem = document.getElementById('account_list');
		this.accountViewElem = document.getElementById('account_view');
		this.messageElem = document.getElementById('message');

		// Start the web socket connection.
		this.webSocket = new WebSocket('ws:' + this.serverHost);
		this.webSocket.onopen = (event) => {
			// this.webSocket.send('TESTING TESTING');
		};
		this.webSocket.onmessage = (message) => {
			
		};
		window.addEventListener('beforeunload', () => {
			this.webSocket.close();
		});

		this.populateAccountList();
	}

	static showMessage(message) {
		document.getElementById('message').innerHTML = message;
	}

	static async populateAccountList() {
		try {
			this.webSocket.send(
			let res = await fetch(this.serverHost + '/account/list');
			let text = await res.text();
			try {
				let json = JSON.parse(text);
				if (Array.isArray(json)) {
					let html = '<ul>';
					for (let i = 0; i < json.length; i++) {
						html += '<li><a href="javascript:viewAccount(\'' + json[i] + '\');">' + json[i] + '</a> <a href="javascript:if (confirm(\'Delete the account &quot;' + json[i] + '&quot;?\')) { deleteAccount(\'' + json[i] + '\'); }">DELETE</a></li>';
					}
					html += '</ul>';
					this.accountListElem.innerHTML = html;
				}
			}
			catch (err) {
				this.showMessage(text);
			}
		}
		catch (err) {
			this.showMessage(err);
		}
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
