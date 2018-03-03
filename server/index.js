"use strict";

const http = require('http');
const querystring = require('querystring');
const fs = require('fs');
const util = require('util')

const client = '//localhost/projects/financio/client/';

function respondWithMessage(res, message) {
	res.writeHead(200, {
		'Content-Type': 'text/plain',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST'
	});
	res.end(message);
}

function invalidRequest(res) {
	respondWithMessage(res, 'Invalid request.');
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
	http.createServer((req, res) => {
		let tokens = req.url.split('/');
		let invalidRequest = false;

		if (tokens.length >= 3) {
			if (req.method === 'POST') {
				let postData = '';
				req.on('data', data => {
					postData += data;
				});
				req.on('end', () => {
					postData = JSON.parse(postData);
					if (tokens[1] === 'account') {
						if (tokens[2] === 'create') {
							if (postData['name'] !== undefined) {
								let name = postData['name'].replace(/[^\w-]/, '');
								if (name !== postData['name'] || postData['name'].length === 0) {
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
							else {
								respondWithMessage(res, 'Please enter an account name.');
							}
						}
						else if (tokens[2] === 'delete') {
							if (postData['name'] !== undefined) {
								let name = postData['name'].replace(/[^\w-]/, '');
								if (name !== postData['name'] || postData['name'].length === 0) {
									respondWithMessage(res, 'The account name "' + postData['name'] + '" is not a valid account name. Please use only alphanumeric, underscore, and dash characters.');
								}
								else {
									if (fs.existsSync('data/accounts/' + name)) {
										if (fs.existsSync('data/accounts/' + name + '/info.json')) {
											fs.unlinkSync('data/accounts/' + name + '/info.json');
										}
										if (fs.existsSync('data/accounts/' + name + '/transactions.json')) {
											fs.unlinkSync('data/accounts/' + name + '/transactions.json');
										}
										fs.rmdirSync('data/accounts/' + name);
										respondWithMessage(res, 'The account "' + name + '" has been deleted.');
									}
									else {
										respondWithMessage(res, 'The account "' + name + '" does not exist.');
									}
								}
							}
							else {
								respondWithMessage(res, 'Please enter an account name.');
							}
						}
						else {
							invalidRequest(res);
						}
					}
					else {
						invalidRequest(res);
					}
				});
			}
			else if (req.method === 'GET') {
				if (tokens[1] === 'account') {
					if (tokens[2] === 'list') {
						fs.readdir('data/accounts/', (err, items) => {
							respondWithMessage(res, JSON.stringify(items));
						});
					}
					else {
						invalidRequest(res);
					}
				}
				else {
					invalidRequest(res);
				}
			}
			else {
				invalidRequest(res);
			}
		}

	}).listen(8080);
}

setupFolders();
startServer();