'use strict';

const WebSocket = require('ws');
const Accounts = require('./accounts.js');

/**
 * @param {WebSocket} ws
 * @param {string} message
 */
async function processMessage(ws, message) {
	console.log('received: %s', message);

	let request = JSON.parse(message);
	let requestData = request.data;
	let responseData;
	let success = false;
	let error = '';
	try {
		if (requestData.command === 'list accounts') {
			responseData = await Accounts.list();
		}
		else if (requestData.command === 'create account') {
			let name = requestData.name;
			let type = requestData.type;
			responseData = await Accounts.create(name, type);
		}
		else if (requestData.command === 'delete account') {
			let name = requestData.name;
			responseData = await Accounts.delete(name);
		}
		else if (requestData.command === 'view account') {
			let name = requestData.name;
			responseData = await Accounts.view(name);
		}
		else if (requestData.command === 'list transactions') {
			let name = requestData.name;
			let startDate = requestData.startDate;
			let endDate = requestData.endDate;
			responseData = await Accounts.listTransactions(name, startDate, endDate);
		}
		else if (requestData.command === 'add transactions') {
			let name = requestData.name;
			let transactions = requestData.transactions;
			responseData = await Accounts.addTransactions(name, transactions);
		}
		success = true;
	}
	catch (e) {
		error = e.message;
	}
	ws.send(JSON.stringify({
		id: request.id,
		success: success,
		error: error,
		data: responseData
	}));
}

function startServer() {
	const wss = new WebSocket.Server({
		port: 8080
	});

	Accounts.initialize();

	console.log('The server has started.');

	wss.on('connection', (ws) => {
		console.log('Accepted a new connection.');
		ws.on('message', (message) => {
			processMessage(ws, message);
		});
		ws.on('close', () => {
			console.log('Closed a connection.');
		});
		ws.on('error', () => {
			console.log('Error in connection.');
		});
	});
}

startServer();
