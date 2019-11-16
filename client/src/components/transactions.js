import { Component, ShowHide } from '../../../../app-js/src/index';
import TransactionList from './transaction_list';
import style from './transactions.css';
import filterSVG from './filter.svg';
import importSVG from './import.svg';
import DateChooser from './date_chooser';
import YMD from './ymd';
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

		this._dateChooser = new DateChooser(this.get('dateChooser'), new YMD());

		this._transactionList = new TransactionList(this.get('transactionList'));

		this._updateFromQuery = this._updateFromQuery.bind(this);

		this._updateFromQuery();

		this._financio.router.addCallback(this._updateFromQuery);
	}

	destroy() {
		this._financio.router.removeCallback(this._updateFromQuery);
		super.destroy();
	}

	async _updateFromQuery() {
		// Set the start and end dates from the query.
		let startDate = this._financio.router.getValue('startDate');
		let endDate = this._financio.router.getValue('endDate');
		const today = new YMD();
		if (!startDate) {
			const threeMonthsBack = new YMD(today.year, today.month - 3, today.day);
			startDate = this._dateToString(threeMonthsBack);
			console.log(startDate);
		}
		if (!endDate) {
			endDate = this._dateToString(today);
		}
		this.get('startDate').value = startDate;
		this.get('endDate').value = endDate;

		// Set the min and max amounts from the query.
		const minAmount = this._financio.router.getValue('minAmount') || '';
		const maxAmount = this._financio.router.getValue('maxAmount') || '';
		this.get('minAmount').value = minAmount;
		this.get('maxAmount').value = maxAmount;

		// Set the search from the query.
		const search = this._financio.router.getValue('search') || '';
		this.get('search').value = search;

		// Update the transactions.
		/** @type {Transaction[]} */
		const transactions = await this._financio.server.send({
			command: 'list transactions',
			name: this._financio.router.getValue('name'),
			startDate: startDate,
			endDate: endDate,
			minAmount: minAmount,
			maxAmount: maxAmount,
			search: search
		});
		this._transactionList.transactions = transactions;
	}

	_toggleFilterForm() {
		const filterForm = this.get('filterForm');
		ShowHide.toggle(filterForm);
	}

	_goToImportTransactions() {
		this._financio.router.pushQuery({
			page: 'importTransactions',
			name: this._financio.router.getValue('name')
		});
	}

	/**
	 * Updates the list of transactions.
	 * @private
	 */
	async _updateQueryFromInputs() {
		// Get the form inputs.
		const filterInputs = this.getFormInputs('filterForm');

		// Set the start date.
		let startDate = '';
		if (filterInputs.startDate !== '') {
			console.log(filterInputs.startDate);
			// Get the date inputs and parse them as Date objects.
			// IT'S OFF BY ONE DAY BECAUSE STARTDATE IS IN THE YYYY-MM-DD FORMAT WHICH IS TAKE TO BE UTC AND THEN CONVERTED TO LOCAL.
			const startDateAsDate = new Date(filterInputs.startDate);
			console.log(startDateAsDate);
			if (isNaN(startDateAsDate)) {
				this.setHtmlVariable('feedback', 'Please enter a valid start date.');
				return;
			}
			startDate = this._dateToString(startDateAsDate);
		}

		// Set the end date.
		let endDate = '';
		if (filterInputs.endDate !== '') {
			const endDateAsDate = new YMD(filterInputs.endDate);
			if (isNaN(endDateAsDate)) {
				this.setHtmlVariable('feedback', 'Please enter a valid end date.');
				return;
			}
			endDate = this._dateToString(endDateAsDate);
		}

		// Get the min and max amounts.
		const minAmount = filterInputs.minAmount;
		const maxAmount = filterInputs.maxAmount;

		// Get the search.
		const search = filterInputs.search;

		this._financio.router.pushQuery({
			page: this._financio.router.getValue('page'),
			name: this._financio.router.getValue('name'),
			startDate: startDate,
			endDate: endDate,
			minAmount: minAmount,
			maxAmount: maxAmount,
			search: search });
	}

	/**
	 * Converts a date to a string.
	 * @param {YMD} date
	 * @returns {string}
	 */
	_dateToString(date) {
		return (date.year + '').padStart(4, '0')
			+ '-' + (date.month + '').padStart(2, '0')
			+ '-' + (date.day + '').padStart(2, '0');
	}
}

Transactions.html = `
	<p><button id="filterButton" onclick="_toggleFilterForm">${filterSVG}</button> <button id="importButton" onclick="_goToImportTransactions">${importSVG}</button></p>
	<div id="dateChooser"></div>
	<form id="filterForm" style="display: none;" action="javascript:">
		<label for="startDate" class="left">Start date:</label>
		<input id="startDate" name="startDate" type="text" class="right" />
		<label for="endDate" class="left">End date:</label>
		<input id="endDate" name="endDate" type="text" class="right" />
		<label for="minAmount" class="left">Minimum amount:</label>
		<input id="minAmount" name="minAmount" type="text" class="right" />
		<label for="maxAmount" class="left">Maximum amount:</label>
		<input id="maxAmount" name="maxAmount" type="text" class="right" />
		<label for="search" class="left">Search:</label>
		<input id="search" name="search" type="text" class="right" />
		<div id="feedback" class="feedback">{{feedback}}</div>
		<button class="submit" onclick="_updateQueryFromInputs">Update</button>
	</form>
	<div id="transactionList"></div>
	`;

Transactions.style = style;
