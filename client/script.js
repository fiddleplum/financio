const server_host = '//localhost:8080';

let account_list_elem = document.getElementById('account_list');
let message_elem = document.getElementById('message');

async function populateAccountList() {
	try {
		let res = await fetch(server_host + '/account/list');
		let text = await res.text();
		try {
			let json = JSON.parse(text);
			if (Array.isArray(json)) {
				let html = '<ul>';
				for (let i = 0; i < json.length; i++) {
					html += '<li>' + json[i] + ' <a href="javascript:void(null);" onclick="if (confirm(\'Delete the account &quot;' + json[i] + '&quot;?\')) { deleteAccount(\'' + json[i] + '\'); }">DELETE</a></li>';
				}
				html += '</ul>';
				account_list_elem.innerHTML = html;
			}
		}
		catch (err) {
			message_elem.innerHTML = text;
		}
	}
	catch (err) {
		message_elem.innerHTML = err;
	}
}

async function createAccount(name) {
	try {
		let res = await fetch(server_host + '/account/create', {
			method: 'post',
			body: JSON.stringify({
				name: name
			})
		});
		let text = await res.text();
		message_elem.innerHTML = text;
		populateAccountList();
	}
	catch (err) {
		message_elem.innerHTML = err;
	}
}

async function deleteAccount(name) {
	try {
		let res = await fetch(server_host + '/account/delete', {
			method: 'post',
			body: JSON.stringify({
				name: name
			})
		});
		let text = await res.text();
		message_elem.innerHTML = text;
		populateAccountList();
	}
	catch (err) {
		message_elem.innerHTML = err;
	}
}