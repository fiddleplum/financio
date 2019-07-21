import Transaction from '../../../src/transaction';
import { Component } from '../../../../app-js/src/index';
import DateChooser from './date_chooser';
/** @typedef {import('../index').default} FinancioApp */

export default class TransactionList extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 * @param {FinancioApp} app
	 */
	constructor(elem, app) {
		super(elem);

		/**
		 * A reference to the app.
		 * @type {FinancioApp}
		 * @private
		 */
		this._app = app;

		/**
		 * The name of the account.
		 * @type {string}
		 * @private
		 */
		this._accountName = this._app.query.get('name');

		// Use today for default values.
		const today = new Date();

		/**
		 * The starting date for the list.
		 * @type {Date}
		 * @private
		 */
		this._startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());

		/**
		 * The ending date for the list.
		 * @type {Date}
		 * @private
		 */
		this._endDate = new Date(today);

		/**
		 * The search term for the list.
		 * @type {string}
		 * @private
		 */
		this._searchTerm = '';

		/**
		 * The start date chooser.
		 * @type {DateChooser}
		 * @private
		 */
		this._stateDateChooser = new DateChooser(this.elem.querySelector('#startDateChooser'));

		/**
		 * The end date chooser.
		 * @type {DateChooser}
		 * @private
		 */
		this._endDateChooser = new DateChooser(this.elem.querySelector('#endDateChooser'));

		// Fill in the options.
		const start = this._app.query.get('start');
		const end = this._app.query.get('end');
		const search = this._app.query.get('search');
		if (start) {
			this._startDate.setFullYear(Number.parseInt(start.substr(0, 4)), Number.parseInt(start.substr(5, 2)) - 1, 1);
		}
		if (end) {
			this._endDate.setFullYear(Number.parseInt(end.substr(0, 4)), Number.parseInt(end.substr(5, 2)) - 1, 1);
		}
		if (search) {
			this._searchTerm = search;
		}

		// Setup initial values for the inputs.
		// this.elem.querySelector('#showTransactions #start_year').value = this._startDate.getFullYear();
		// this.elem.querySelector('#showTransactions #start_month').value = ('' + (this._startDate.getMonth() + 1)).padStart(2, '0');
		// this.elem.querySelector('#showTransactions #end_year').value = this._endDate.getFullYear();
		// this.elem.querySelector('#showTransactions #end_month').value = ('' + (this._endDate.getMonth() + 1)).padStart(2, '0');

		// Set the action for the submit button.
		this.elem.querySelector('#showTransactions #submit').addEventListener('click', () => {
			const startYear = this.elem.querySelector('#showTransactions #start_year').value;
			const startMonth = this.elem.querySelector('#showTransactions #start_month').value;
			const endYear = this.elem.querySelector('#showTransactions #end_year').value;
			const endMonth = this.elem.querySelector('#showTransactions #end_month').value;
			this._app.query.push({
				section: 'accounts',
				action: 'view',
				name: this._accountName,
				start: startYear + '-' + startMonth,
				end: endYear + '-' + endMonth
			});
		});

		// Setup the drag-and-drop import capability.
		let importElem = this.elem.querySelector('#import');
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
						await window.app.ws.send({
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
		let transactions = await this._app.ws.send({
			'command': 'list transactions',
			'name': this._accountName,
			'startDate': this._startDate.toISOString(),
			'endDate': this._endDate.toISOString()
		});
		let html = `
			<div class="transaction heading">
				<div class="date">Date</div>
				<div class="description">Description</div>
				<div class="amount">Amount</div>
				<div class="category">Category</div>
			</div>`;
		if (transactions.length > 0) {
			for (let i = 0, l = transactions.length; i < l; i++) {
				let transaction = transactions[i];
				html += `
					<div class="transaction ` + (i % 2 === 0 ? `even` : `odd`) + `">
						<div class="date">` + transaction.date.substr(0, 10) + `</div>
						<div class="description">` + transaction.description + `</div>
						<div class="amount">` + Number.parseFloat(transaction.amount).toFixed(2) + `</div>
						<div class="category">` + transaction.category + `</div>
					</div>`;
			}
		}
		else {
			html = `<tr><td colspan=4>There are no transactions.</td></tr>`;
		}
		this.elem.querySelector('#transactions').innerHTML = html;
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
				transaction.date = transaction.date.substr(0, 4) + '-' + transaction.date.substr(4, 2) + '-' + transaction.date.substr(6, 2) + 'T00:00:00.000Z';
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

TransactionList.html = `
	<h1>Transactions</h1>
	<div>Start: <div id="startDateChooser"></div></div>
	<div>End: <div id="endDateChooser"></div></div>
	<div id="submit" class="button">List Transactions</div>
	<div id="import">(Drag a file here to import it)</div>
	<div id="transactions">
	</div>
	`;

TransactionList.style = `
	.TransactionList {
		text-align: center;
	}
	.TransactionList #startDateChooser,
	.TransactionList #endDateChooser {
	}
	.TransactionList #import {
		margin-top: 1em;
		margin-bottom: 1em;
	}
	.TransactionList #transactions {
		margin: auto;
	}
	.TransactionList .transaction {
		display: grid;
		grid-template-columns: 8em 1fr 6em 10em;
		grid-template-rows: 1.5em;
		grid-template-areas:
			"date description amount category";
	}
	.TransactionList .date {
		grid-area: date;
		text-align: left;
		line-height: 1.5em;
	}
	.TransactionList .description {
		grid-area: description;
		text-align: left;
		line-height: 1.5em;
		overflow: hidden;
	}
	.TransactionList .amount {
		grid-area: amount;
		text-align: right;
		line-height: 1.5em;
	}
	.TransactionList .category {
		grid-area: category;
		text-align: right;
		line-height: 1.5em;
		padding-left: 1em;
	}
	.TransactionList .transaction {
		border-bottom: 1px solid black;
	}
	.TransactionList .odd td {
		background: var(--bg-dark);
		color: var(--fg-dark);
	}
	@media (max-width: 60em) {
		.TransactionList .heading {
			display: none;
		}
		.TransactionList .transaction {
			grid-template-columns: 6em 1fr 6em;
			grid-template-rows: 1.5em 1.5em;
			grid-template-areas:
				"date category category"
				"description description amount";
		}
	}
	@media (max-width: 30em) {
		.TransactionList .transaction {
			grid-template-columns: 6em 1fr 6em;
			grid-template-rows: 1.5em 1.5em 1.5em;
			grid-template-areas:
				"date . amount"
				"description description description"
				"category category .";
		}
		.TransactionList .category {
			text-align: left;
		}
	}
	`;
