import { Component } from '../../../../app-js/src/index';
import TransactionList from './transaction_list';
import style from './transactions.css';
import filterSVG from './filter.svg';
import importSVG from './import.svg';
/** @typedef {import('../../../src/transaction').default} Transaction */
/** @typedef {import('../financio').default} Financio */

/**
 * The transactions page.
 */
export default class Transactions extends Component {
	/**
	 * Constructs the app.
	 * @param {HTMLElement} elem - The element inside which thee the component will reside.
	 * @param {Financio} financio - The app.
	 */
	constructor(elem, financio) {
		super(elem);

		/**
		 * The app.
		 * @type {Financio}
		 * @private
		 */
		this._financio = financio;

		this._startYear = '';
		this._startMonth = '';
		this._startDay = '';
		this._endYear = '';
		this._endMonth = '';
		this._endDay = '';

		this._transactionList = new TransactionList(this.get('transactionList'), this._financio);

		// Get the start date from the query.
		const start = this._financio.router.getValueOf('start');
		const end = this._financio.router.getValueOf('end');
		const today = new Date();
		if (start) {
			this._startYear = start.substr(0, 4);
			this._startMonth = start.substr(5, 2);
			this._startDay = start.substr(8, 2);
		}
		else {
			const threeMonthsBack = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
			this._startYear = (threeMonthsBack.getFullYear() + '').padStart(4, '0');
			this._startMonth = ((threeMonthsBack.getMonth() + 1) + '').padStart(2, '0');
			this._startDay = (threeMonthsBack.getDate() + '').padStart(2, '0');
		}
		if (end) {
			this._endYear = end.substr(0, 4);
			this._endMonth = end.substr(5, 2);
			this._endDay = end.substr(8, 2);
		}
		else {
			this._endYear = (today.getFullYear() + '').padStart(4, '0');
			this._endMonth = ((today.getMonth() + 1) + '').padStart(2, '0');
			this._endDay = (today.getDate() + '').padStart(2, '0');
		}

		this.get('startDate').value = this._startYear + '-' + this._startMonth + '-' + this._startDay;
		this.get('endDate').value = this._endYear + '-' + this._endMonth + '-' + this._endDay;

		this.on('filterButton', 'click', this.toggleFilterForm);
		this.on('importButton', 'click', this.goToImportTransactions);
		this.on('submitButton', 'click', this.submitForm);

		this.update();
	}

	toggleFilterForm() {
		const filterForm = this.get('filterForm');
		filterForm.classList.toggle('disabled');
	}

	goToImportTransactions() {
		this._financio.router.push({
			page: 'importTransactions',
			name: this._financio.router.getValueOf('name')
		});
	}

	async submitForm(event) {
		// Send the command to the server.
		try {
			const startDate = new Date(this.get('startDate').value);
			const endDate = new Date(this.get('endDate').value);
			if (isNaN(startDate)) {
				throw new Error('Please enter a valid start date.');
			}
			if (isNaN(endDate)) {
				throw new Error('Please enter a valid end date.');
			}
			if (startDate > endDate) {
				throw new Error('The start date must be equal to or prior to the end date.');
			}
			this._startYear = (startDate.getUTCFullYear() + '').padStart(4, '0');
			this._startMonth = ((startDate.getUTCMonth() + 1) + '').padStart(2, '0');
			this._startDay = (startDate.getUTCDate() + '').padStart(2, '0');
			this._endYear = (endDate.getUTCFullYear() + '').padStart(4, '0');
			this._endMonth = ((endDate.getUTCMonth() + 1) + '').padStart(2, '0');
			this._endDay = (endDate.getUTCDate() + '').padStart(2, '0');
			await this.update();
		}
		catch (error) {
			this.get('feedback').innerHTML = error.message;
		}
	}

	/**
	 * Updates the list of transactions.
	 * @private
	 */
	async update() {
		/** @type {Transaction[]} */
		const transactions = await this._financio.server.send({
			command: 'list transactions',
			name: this._financio.router.getValueOf('name'),
			startDate: this._startYear + '-' + this._startMonth + '-' + this._startDay,
			endDate: this._endYear + '-' + this._endMonth + '-' + this._endDay
		});
		this._transactionList.transactions = transactions;
	}
}

Transactions.html = `
	<p><button id="filterButton">` + filterSVG + `</button> <button id="importButton">` + importSVG + `</button></p>
	<form id="filterForm" class="disabled" action="javascript:void(null);">
		<label for="startDate" class="left">Start:</label>
		<input id="startDate" name="startDate" type="text" class="right startDate" />
		<label for="endDate" class="left">End:</label>
		<input id="endDate" name="endDate" type="text" class="right endDate" />
		<div id="feedback" class="feedback"></div>
		<button id="submitButton" class="submit">Update</button>
	</form>
	<div id="transactionList"></div>
	`;

Transactions.style = style;
