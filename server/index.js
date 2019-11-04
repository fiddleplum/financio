'use strict';

const fs = require('fs');
const WebSocket = require('ws');
const Accounts = require('./accounts.js');
const Categories = require('./categories.js');

/**
 * @param {WebSocket} ws
 * @param {string} message
 */
async function processMessage(ws, message) {

	let request = JSON.parse(message);
	let requestData = request.data;
	let responseData;
	let success = false;
	let error = '';
	console.log('received: %s', JSON.stringify(requestData));
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
		else if (requestData.command === 'rename account') {
			let name = requestData.name;
			let newName = requestData.newName;
			responseData = await Accounts.rename(name, newName);
		}
		else if (requestData.command === 'list transactions') {
			let name = requestData.name;
			let startDate = requestData.startDate;
			let endDate = requestData.endDate;
			let search = requestData.search;
			console.log('started');
			responseData = await Accounts.listTransactions(name, startDate, endDate, search);
			console.log('done');
		}
		else if (requestData.command === 'check duplicate transactions') {
			let name = requestData.name;
			let transactions = requestData.transactions;
			responseData = await Accounts.checkDuplicateTransactions(name, transactions);
		}
		else if (requestData.command === 'add transactions') {
			let name = requestData.name;
			let transactions = requestData.transactions;
			responseData = await Accounts.addTransactions(name, transactions);
		}
		else if (requestData.command === 'get categories') {
			responseData = await Categories.get();
		}
		else if (requestData.command === 'set categories') {
			let categories = requestData.categories;
			responseData = await Categories.set(categories);
		}
		else {
			throw new Error('Unknown command.');
		}
		success = true;
	}
	catch (e) {
		console.log(e.message);
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
		port: 8081
	});

	if (!fs.existsSync('data/')) {
		fs.mkdirSync('data/');
	}

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
