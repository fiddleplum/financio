import Transaction from '../../../src/transaction';
import { Component } from 'app-js';

class TransactionList extends Component {
	constructor(gridArea, accountName, startDate, endDate, searchTerm) {
		super(gridArea);

		/**
		 * The name of the account.
		 * @type {string}
		 * @private
		 */
		this._accountName = accountName;

		/**
		 * The starting date for the list.
		 * @type {Date}
		 * @private
		 */
		this._startDate = startDate;

		/**
		 * The ending date for the list.
		 * @type {Date}
		 * @private
		 */
		this._endDate = endDate;

		/**
		 * The search term for the list.
		 * @type {string}
		 * @private
		 */
		this._searchTerm = searchTerm;

		this.__style = `
			#transaction-list {
				padding: 1em;
				overflow-y: auto;
				text-align: center;
			}
			#transaction-list #import {
				margin-top: 1em;
				margin-bottom: 1em;
			}
			#transaction-list table {
				display: inline-block;
				border-collapse: collapse;
			}
			#transaction-list table td.date.heading{
				width: 10em;
			}
			#transaction-list table td.description.heading{
				width: 30em;
				overflow-x: none;
			}
			#transaction-list table td.amount.heading{
				width: 6em;
			}
			#transaction-list table td.category.heading{
				width: 12em;
			}
			#transaction-list td {
				padding: .25em;
			}
			#transaction-list td.amount {
				text-align: right;
			}
			#transaction-list tr:first-child td:first-child {
				border-top-left-radius: .25em;
			}
			#transaction-list tr:first-child td:last-child {
				border-top-right-radius: .25em;
			}
			#transaction-list .odd td {
				background: var(--bg-dark);
				color: var(--fg-dark);
			}
			`;
		this.__div.id = 'transaction-list';
		this.__div.innerHTML = `
			<div class="page_title">Transactions</div>
			<div id="import">(Drag a file here to import it)</div>
			<table id="transactions">
			</table>
			`;

		// Setup the drag-and-drop import capability.
		let importElem = this.__div.querySelector('#import');
		importElem.addEventListener('dragover', (e) => {
			e.stopPropagation();
			e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
		}, false);
		importElem.addEventListener('drop', (e) => {
			e.stopPropagation();
			e.preventDefault();
			var files = e.dataTransfer.files;

			for (let i = 0, l = files.length; i < l; i++) {
				let file = files[i];
				let extension = file.name.split('.').pop().toLowerCase();
				var reader = new FileReader();
				if (extension === 'qfx' || extension === 'ofx') {
					reader.onload = async (e2) => {
						let transactions = await TransactionList._getTransactionsFromOFX(e2.target.result);
						await window.financio.ws.send({
							'command': 'add transactions',
							'name': this._accountName,
							'transactions': transactions
						});
						this._update();
					};
					reader.readAsText(file); // start reading the file data.
				}
			}
		}, false);

		this._update();
	}

	/**
	 * Sets the date range for the transaction list.
	 * @param {string} startDate
	 * @param {string} endDate
	 */
	async setDateRange(startDate, endDate) {
		this._startDate = startDate;
		this._endDate = endDate;
		await this._update();
	}

	/**
	 * Updates the list of transactions.
	 * @private
	 */
	async _update() {
		/** @type {Transaction[]} */
		let transactions = await window.financio.ws.send({
			'command': 'list transactions',
			'name': this._accountName,
			'startDate': this._startDate,
			'endDate': this._endDate
		});
		let html = `<tr class="odd"><td class="date heading">Date</td><td class="description heading">Description</td><td class="amount heading">Amount</td><td class="category heading">Category</td></tr>`;
		if (transactions.length > 0) {
			for (let i = 0, l = transactions.length; i < l; i++) {
				let transaction = transactions[i];
				html += `
					<tr class="` + (i % 2 === 0 ? `even` : `odd`) + `">
						<td class="date">` + transaction.date.substr(0, 10) + `</td>
						<td class="description">` + transaction.description + `</td>
						<td class="amount">` + Number.parseFloat(transaction.amount).toFixed(2) + `</td>
						<td class="category">` + transaction.category + `</td>
					</tr>`;
			}
		}
		else {
			html = `<tr><td colspan=4>There are no transactions.</td></tr>`;
		}
		this.__div.querySelector('#transactions').innerHTML = html;
	}

	/**
	 * Returns a list of transactions imported from an OFX file.
	 * @param {string} content
	 * @returns {Transaction[]}
	 * @private
	 */
	static async _getTransactionsFromOFX(content) {
		/** @type {Transaction[]} */
		let transactions = [];
		let i = 0;
		while (i < content.length) {
			i = content.indexOf('<STMTTRN>', i) + '<STMTTRN>'.length;
			if (i === -1 + '<STMTTRN>'.length) {
				break;
			}
			let endI = content.indexOf('</STMTTRN>', i) + '</STMTTRN>'.length;
			let amountI = content.indexOf('<TRNAMT>', i) + '<TRNAMT>'.length;
			let dateI = content.indexOf('<DTPOSTED>', i) + '<DTPOSTED>'.length;
			let nameI = content.indexOf('<NAME>', i) + '<NAME>'.length;
			let idI = content.indexOf('<FITID>', i) + '<FITID>'.length;
			if (idI < endI && dateI < endI && amountI < endI) {
				let transaction = new Transaction();
				transaction.id = content.substr(idI, content.indexOf('<', idI) - idI).trim();
				transaction.date = content.substr(dateI, content.indexOf('<', dateI) - dateI).trim();
				transaction.date = transaction.date.substr(0, 4) + '-' + transaction.date.substr(4, 2) + '-' + transaction.date.substr(6, 2) + ' 00:00:00.000';
				transaction.amount = content.substr(amountI, content.indexOf('<', amountI) - amountI).trim();
				if (nameI < endI) {
					transaction.description = content.substr(nameI, content.indexOf('<', nameI) - nameI).trim();
				}
				transactions.push(transaction);
			}
		}
		return transactions;
	}
}

export default TransactionList;
