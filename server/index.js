'use strict';

import Account from './account';

const fsPromises = require('fs').promise;
const WebSocket = require('ws');
const Accounts = require('./accounts.js');

/**
 * @type {Map<string, Account>}
 */
let accounts = {};

/**
 * @param {WebSocket} ws
 * @param {string} message
 */
async function processMessage(ws, message) {
	console.log('received: %s', message);

	let request = JSON.parse(message);
	let requestData = request.data;
	let responseData = undefined;
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
	else if (requestData.command === 'get account info') {
		let name = requestData.name;
		responseData = await Accounts.getInfo(name);
	}
	else if (requestData.command === 'list transactions') {
		let name = requestData.name;
		let start = requestData.start;
		let length = requestData.length;
		responseData = await Accounts.listTransactions(name, start, length);
	}
	else if (requestedData.command === 'add transactions') {
		let name = requestData.name;
		let transactions = requestData.transactions;
		responseData = await Accounts.addTransactions(name, transactions);
	}
	ws.send(JSON.stringify({
		id: request.id,
		data: responseData
	}));
}

async function setupFolders() {
	try {
		await fsPromises.mkdir('data');
	}
	catch (e) {
	}

	try {
		await fsPromises.mkdir('data/accounts');
	}
	catch (e) {
	}
}

function startServer() {
	const wss = new WebSocket.Server({
		port: 8080
	});

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

setupFolders();
startServer();
