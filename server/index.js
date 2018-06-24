'use strict';

// const http = require('http');
const querystring = require('querystring');
const fsPromises = require('fs').promises;
const util = require('util');
const WebSocket = require('ws');
const Accounts = require('./accounts.js');

// function respondWithMessage(res, status, message) {
// 	res.writeHead(status, {
// 		'Content-Type': 'text/plain',
// 		'Access-Control-Allow-Origin': '*',
// 		'Access-Control-Allow-Methods': 'GET, POST'
// 	});
// 	res.end(message);
// }

// reject('The name "' + name + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');

async function processMessage(ws, message) {
	console.log('received: %s', message);

	let request = JSON.parse(message);
	let response = null;
	if (request.subject === 'accounts') {
		if (request.verb === 'list') {
			response = await Accounts.list();
		}
		else if (request.verb === 'get') {
			response = await Accounts.get(request.name);
		}
		else if (request.verb === 'create') {
			response = await Accounts.create(request.name, request.type);
		}
		else if (request.verb === 'delete') {
			response = await Accounts.delete(request.name);
		}
	}
	ws.send(JSON.stringify(response));
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
		ws.send('something');
	});

	// http.createServer((req, res) => {
	// 	let tokens = req.url.split('/');
	// 	let invalidRequest = false;

	// 	// Break off the host part.
	// 	let host = tokens[0];
	// 	tokens = tokens.splice(0, 1);

	// 	// Sanitize the tokens.
	// 	for (let i = 0; i < tokens.length; i++) {
	// 		let token = tokens[i].replace(/[^\w-']/, '');
	// 		if (token !== tokens[i]) {
	// 			respondWithMessage(res, 400, 'The token "' + tokens[i] + '" is not a valid token. Please use only alphanumeric, underscore, dash and single quote characters.');
	// 			return;
	// 		}
	// 	}

	// 	if (tokens.length >= 0 && tokens[0] === 'accounts') {
	// 		if (req.method === 'PUT') {
	// 			if (tokens.length >= 3) {
	// 				let name = tokens[1];
	// 				let type = tokens[2];
	// 				if (fs.existsSync('data/accounts/' + name)) {
	// 					respondWithMessage(res, 400, 'The account "' + name + '" already exists.');
	// 					return;
	// 				}
	// 				fs.mkdirSync('data/accounts/' + name);
	// 			}
	// 		}
	// 		else if (req.method === 'DELETE') {}
	// 		else if (req.method === 'GET') {}
	// 	}
	// 	if (tokens.length >= 3) {
	// 		if (req.method === 'POST') {
	// 			let postData = '';
	// 			req.on('data', (data) => {
	// 				postData += data;
	// 			});
	// 			req.on('end', () => {
	// 				postData = JSON.parse(postData);
	// 				if (tokens[0] === 'accounts') {
	// 					if (tokens[1] === 'create') {
	// 						if (postData['name'] !== undefined) {
	// 							let name = postData['name'].replace(/[^\w-]/, '');
	// 							if (name !== postData['name'] || postData['name'].length === 0) {
	// 								respondWithMessage(res, 400, 'The account name "' + postData['name'] + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
	// 							}
	// 							else {
	// 								if (fs.existsSync('data/accounts/' + name)) {
	// 									respondWithMessage(res, 400, 'The account "' + name + '" already exists.');
	// 								}
	// 								else {
	// 									fs.mkdirSync('data/accounts/' + name);
	// 									let type = 'credit';
	// 									if (postData['type'] !== undefined && typeof postData['type'] === 'string') {
	// 										type = postData['type'];
	// 									}
	// 									fs.writeFileSync('data/accounts/' + name + '/info.json', JSON.stringify({
	// 										type: type
	// 									}));
	// 									respondWithMessage(res, 200, 'The account "' + name + '" has been created.');
	// 								}
	// 							}
	// 						}
	// 						else {
	// 							respondWithMessage(res, 400, 'Please enter an account name.');
	// 						}
	// 					}
	// 					else if (tokens[1] === 'delete') {
	// 						if (postData['name'] !== undefined) {
	// 							let name = postData['name'].replace(/[^\w-]/, '');
	// 							if (name !== postData['name'] || postData['name'].length === 0) {
	// 								respondWithMessage(res, 400, 'The account name "' + postData['name'] + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
	// 							}
	// 							else {
	// 								if (fs.existsSync('data/accounts/' + name)) {
	// 									if (fs.existsSync('data/accounts/' + name + '/info.json')) {
	// 										fs.unlinkSync('data/accounts/' + name + '/info.json');
	// 									}
	// 									if (fs.existsSync('data/accounts/' + name + '/transactions.json')) {
	// 										fs.unlinkSync('data/accounts/' + name + '/transactions.json');
	// 									}
	// 									fs.rmdirSync('data/accounts/' + name);
	// 									respondWithMessage(res, 200, 'The account "' + name + '" has been deleted.');
	// 								}
	// 								else {
	// 									respondWithMessage(res, 400, 'The account "' + name + '" does not exist.');
	// 								}
	// 							}
	// 						}
	// 						else {
	// 							respondWithMessage(res, 400, 'Please enter an account name.');
	// 						}
	// 					}
	// 					else {
	// 						respondWithMessage(res, 400, 'Invalid request.');
	// 					}
	// 				}
	// 				else {
	// 					respondWithMessage(res, 400, 'Invalid request.');
	// 				}
	// 			});
	// 		}
	// 		else if (req.method === 'GET') {
	// 			if (tokens[0] === 'accounts') {
	// 				if (tokens[1] === 'list') {
	// 					accounts.process(res, req.method, tokens);
	// 					fs.readdir('data/accounts/', (err, items) => {
	// 						respondWithMessage(res, 200, JSON.stringify(items));
	// 					});
	// 				}
	// 				else if (tokens[1] === 'info') {
	// 					let name = postData['name'].replace(/[^\w-]/, '');
	// 					if (name !== postData['name'] || postData['name'].length === 0) {
	// 						respondWithMessage(res, 400, 'The account name "' + postData['name'] + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
	// 					}
	// 					else {
	// 						if (fs.existsSync('data/accounts/' + name)) {}
	// 					}
	// 				}
	// 				else {
	// 					respondWithMessage(res, 400, 'Invalid request.');
	// 				}
	// 			}
	// 			else {
	// 				respondWithMessage(res, 400, 'Invalid request.');
	// 			}
	// 		}
	// 		else {
	// 			respondWithMessage(res, 400, 'Invalid request.');
	// 		}
	// 	}
	// }).listen(8080);
}

setupFolders();
startServer();
