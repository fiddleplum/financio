import Transaction from '../../src/transaction';

class ElemTransactionList extends HTMLElement {
	constructor() {
		super();

		this._ws = null;

		this._accountName = '';

		let end = new Date();
		let start = new Date(end);
		start.setMonth(start.getMonth() - 3);
		this._startDate = start.toISOString().split('T')[0];
		this._endDate = end.toISOString().split('T')[0];
	}

	connectedCallback() {
		this.innerHTML = `
			<style>
				elem-transaction-list #content {
					text-align: center;
				}
				elem-transaction-list #import {
					margin-top: 1em;
					margin-bottom: 1em;
				}
				elem-transaction-list table {
					display: inline-block;
					border-collapse: collapse;
				}
				elem-transaction-list table td.date.heading{
					width: 6em;
				}
				elem-transaction-list table td.description.heading{
					width: 18em;
					overflow-x: none;
				}
				elem-transaction-list table td.amount.heading{
					width: 6em;
				}
				elem-transaction-list table td.category.heading{
					width: 12em;
				}
				elem-transaction-list td {
					padding: .25em;
				}
				elem-transaction-list td.amount {
					text-align: right;
				}
				elem-transaction-list tr:first-child td:first-child {
					border-top-left-radius: .25em;
				}
				elem-transaction-list tr:first-child td:last-child {
					border-top-right-radius: .25em;
				}
				elem-transaction-list .odd td {
					background: var(--bg);
				}
			</style>
			<div id="content">
				<div class="title">Transactions</div>
				<div id="import">(Drag a file here To import it)</div>
				<table id="transactions">
				</table>
			</div>`;

		// Setup the drag-and-drop import capability.
		let contentElem = this.querySelector('#content');
		contentElem.addEventListener('dragover', (e) => {
			e.stopPropagation();
			e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
		}, false);
		contentElem.addEventListener('drop', (e) => {
			e.stopPropagation();
			e.preventDefault();
			var files = e.dataTransfer.files;

			for (let i = 0, l = files.length; i < l; i++) {
				let file = files[i];
				let extension = file.name.split('.').pop().toLowerCase();
				var reader = new FileReader();
				if (extension === 'qfx' || extension === 'ofx') {
					reader.onload = async (e2) => {
						let transactions = await ElemTransactionList._getTransactionsFromOFX(e2.target.result);
						await this._ws.send({
							'command': 'add transactions',
							'name': this._accountName,
							'transactions': transactions
						});
					};
					reader.readAsText(file); // start reading the file data.
				}
			}
		}, false);
	}

	initialize(ws, accountName) {
		this._ws = ws;
		this._accountName = accountName;
		this._update();
	}

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
		if (this._ws !== null) {
			let transactions = await this._ws.send({
				'command': 'list transactions',
				'name': this._accountName,
				'startDate': this._startDate,
				'endDate': this._endDate
			});
			let html = `<tr class="odd"><td class="date heading">Date</td><td class="description heading">Description</td><td class="amount heading">Amount</td><td class="category heading">Category</td></tr>`;
			if (transactions.length > 0) {
				for (let i = 0, l = transactions.length; i < l; i++) {
					let transaction = transactions[i];
					html += `<tr class="` + (i % 2 === 0 ? `even` : `odd`) + `"><td class="date">` + transaction.date + `</td><td class="description">` + transaction.description + `</td><td class="amount">` + transaction.amount + `</td><td class="category">` + transaction.category + `</td></tr>`;
				}
			}
			else {
				html = `<tr><td colspan=4>There are no transactions.</td></tr>`;
			}
			this.querySelector('#transactions').innerHTML = html;
		}
	}

	/**
	 * @param {string} content
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

window.customElements.define('elem-transaction-list', ElemTransactionList);

export default ElemTransactionList;
