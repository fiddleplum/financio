"use strict";

const http = require('http');
const querystring = require('querystring');
const fs = require('fs');
const util = require('util')

var sentMessage = false;
function respondWithMessage(res, message) {
	res.writeHead(200, {
		'Content-Type': 'text/plain'
	});
	res.end(message);
	sentMessage = true;
}

function setupFolders() {
	if (!fs.existsSync('data')) {
		fs.mkdirSync('data');
	}
	if (!fs.existsSync('data/accounts')) {
		fs.mkdirSync('data/accounts');
	}
}

function startServer() {
	http.createServer(function (req, res) {
		let tokens = req.url.split('/');

		if (tokens.length >= 3) {
			if (req.method === 'POST') {
				let postData = '';
				req.on('data', function (data) {
					postData += data;
				});
				req.on('end', function () {
					postData = querystring.parse(postData);
					if (tokens[1] === 'account') {
						if (tokens[2] === 'create') {
							if (postData['name'] !== undefined) {
								let name = postData['name'].replace(/[^\w-]/, '');
								if (name !== postData['name'] || postData['name'].length == 0) {
									respondWithMessage(res, 'The account name "' + postData['name'] + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
								}
								else {
									if (fs.existsSync('data/accounts/' + name)) {
										respondWithMessage(res, 'The account "' + name + '" already exists.');
									}
									else {
										fs.mkdirSync('data/accounts/' + name);
										respondWithMessage(res, 'The account "' + name + '" has been created.');
									}
								}
							}
						}
					}
				});
			}
			else if (req.method === 'GET') {}
			if (!sentMessage) {
				respondWithMessage(res, 'Invalid request.');
			}
		}

	}).listen(8080);
}

setupFolders();
startServer();