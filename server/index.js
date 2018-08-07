'use strict';

const fsPromises = require('fs').promise;
const WebSocket = require('ws');
const Accounts = require('./accounts.js');

async function processMessage(ws, message) {
	console.log('received: %s', message);

	let request = JSON.parse(message);
	let requestData = request.data;
	let responseData = null;
	if (requestData.command === 'list accounts') {
		responseData = await Accounts.list();
	}
	else if (requestData.command === 'create account') {
		responseData = await Accounts.create(requestData.name, requestData.type);
	}
	else if (requestData.command === 'delete account') {
		responseData = await Accounts.delete(requestData.name);
	}
	else if (requestData.command === 'get account info') {
		responseData = await Accounts.getInfo(requestData.name);
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
