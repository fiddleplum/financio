import { Component, ShowHide } from '../../../../app-js/src/index';
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

		/**
		 * The start year in YYYY format.
		 * @type {string}
		 * @private
		 */
		this._startYear = '';

		/**
		 * The start month in MM format.
		 * @type {string}
		 * @private
		 */
		this._startMonth = '';

		/**
		 * The start day in DD format.
		 * @type {string}
		 * @private
		 */
		this._startDay = '';

		/**
		 * The end year in YYYY format.
		 * @type {string}
		 * @private
		 */
		this._endYear = '';

		/**
		 * The end month in MM format.
		 * @type {string}
		 * @private
		 */
		this._endMonth = '';

		/**
		 * The end day in DD format.
		 * @type {string}
		 * @private
		 */
		this._endDay = '';

		/**
		 * A term to search for.
		 * @type {string}
		 * @private
		 */
		this._search = '';

		this._transactionList = new TransactionList(this.get('transactionList'));

		this._initializeFilterInputs();

		this.update();
	}

	_initializeFilterInputs() {
		// Get the start date from the query.
		const start = this._financio.router.getValue('start');
		const end = this._financio.router.getValue('end');

		// Set the dates for the state.
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

		this._search = this._financio.router.getValue('search');

		// Set the values of the inputs.
		this.get('startDate').value = this._startYear + '-' + this._startMonth + '-' + this._startDay;
		this.get('endDate').value = this._endYear + '-' + this._endMonth + '-' + this._endDay;

		if (this._search) {
			this.get('search').value = this._search;
		}
	}

	_toggleFilterForm() {
		const filterForm = this.get('filterForm');
		ShowHide.toggle(filterForm);
	}

	_goToImportTransactions() {
		this._financio.router.pushQuery({
			page: 'importTransactions',
			name: this._financio.router.get('name')
		});
	}

	async _submitForm(event) {
		const filterInputs = this.getFormInputs('filterForm');
		// Send the command to the server.
		try {
			// Get the date inputs and parse them as Date objects.
			const startDate = new Date(filterInputs.startDate);
			const endDate = new Date(filterInputs.endDate);
			if (isNaN(startDate)) {
				throw new Error('Please enter a valid start date.');
			}
			if (isNaN(endDate)) {
				throw new Error('Please enter a valid end date.');
			}
			if (startDate > endDate) {
				throw new Error('The start date must be equal to or prior to the end date.');
			}

			// Set the start and end dates using the Date objects.
			this._startYear = (startDate.getUTCFullYear() + '').padStart(4, '0');
			this._startMonth = ((startDate.getUTCMonth() + 1) + '').padStart(2, '0');
			this._startDay = (startDate.getUTCDate() + '').padStart(2, '0');
			this._endYear = (endDate.getUTCFullYear() + '').padStart(4, '0');
			this._endMonth = ((endDate.getUTCMonth() + 1) + '').padStart(2, '0');
			this._endDay = (endDate.getUTCDate() + '').padStart(2, '0');

			// Set the search input.
			this._search = filterInputs.search;

			// Update the transation list.
			await this.update();
		}
		catch (error) {
			this.setHtmlVariable('feedback', error.message);
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
			name: this._financio.router.getValue('name'),
			startDate: this._startYear + '-' + this._startMonth + '-' + this._startDay,
			endDate: this._endYear + '-' + this._endMonth + '-' + this._endDay,
			search: this._search
		});
		this._transactionList.transactions = transactions;
	}
}

Transactions.html = `
	<p><button id="filterButton" onclick="_toggleFilterForm">${filterSVG}</button> <button id="importButton" onclick="_goToImportTransactions">${importSVG}</button></p>
	<form id="filterForm" style="display: none;" action="javascript:">
		<label for="startDate" class="left">Start:</label>
		<input id="startDate" name="startDate" type="text" class="right" />
		<label for="endDate" class="left">End:</label>
		<input id="endDate" name="endDate" type="text" class="right" />
		<label for="search" class="left">Search:</label>
		<input id="search" name="search" type="text" class="right" />
		<div id="feedback" class="feedback">{{feedback}}</div>
		<button class="submit" onclick="_submitForm">Update</button>
	</form>
	<div id="transactionList"></div>
	`;

Transactions.style = style;
