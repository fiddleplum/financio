import { Component, ShowHide } from '../../../../app-js/src/index';
import TransactionList from './transaction_list';
import style from './transactions.css';
import filterSVG from './filter.svg';
import importSVG from './import.svg';
import DateChooser from './date_chooser';
import YMD from './ymd';
/** @typedef {import('../../../src/transaction').default} Transaction */
/** @typedef {import('../financio').default} Financio */

/** The transactions page. */
export class Transactions extends Component {
	private startDate: DateChooser;

	constructor(params: Component.Params) {
		super(params);

		/**
		 * The start date input.
		 * @type {DateChooser}
		 * @private
		 */
		this._startDate = this.__component('startDate');

		/**
		 * The end date input.
		 * @type {DateChooser}
		 * @private
		 */
		this._endDate = this.__component('endDate');

		this._transactionList = new TransactionList(this.get('transactionList'));

		this._updateFromQuery = this._updateFromQuery.bind(this);

		this._updateFromQuery();

		this._app.router.addCallback(this._updateFromQuery);
	}

	destroy() {
		this._app.router.removeCallback(this._updateFromQuery);
		super.destroy();
	}

	async _updateFromQuery() {
		// Set the start and end dates from the query.
		let startDate = this._app.router.getValue('startDate');
		let endDate = this._app.router.getValue('endDate');
		const today = new YMD();
		if (!startDate) {
			startDate = new YMD(today.year, today.month - 3, today.day);
		}
		else {
			startDate = new YMD(startDate);
		}
		if (!endDate) {
			endDate = today;
		}
		else {
			endDate = new YMD(endDate);
		}

		// Set the components.
		this._startDate.date = startDate;
		this._endDate.date = endDate;

		// Set the min and max amounts from the query.
		const minAmount = this._app.router.getValue('minAmount') || '';
		const maxAmount = this._app.router.getValue('maxAmount') || '';
		this.get('minAmount').value = minAmount;
		this.get('maxAmount').value = maxAmount;

		// Set the search from the query.
		const search = this._app.router.getValue('search') || '';
		this.get('search').value = search;

		// Update the transactions.
		/** @type {Transaction[]} */
		const transactions = await this._app.server.send({
			command: 'list transactions',
			name: this._app.router.getValue('name'),
			startDate: startDate.toString(),
			endDate: endDate.toString(),
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
		this._app.router.pushQuery({
			page: 'importTransactions',
			name: this._app.router.getValue('name')
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
		if (!isNaN(this._startDate.date.year)) {
			// Get the date inputs and parse them as Date objects.
			try {
				startDate = this._startDate.date.toString();
			}
			catch (e) {
				this.setHtmlVariable('feedback', 'Please enter a valid start date.');
				return;
			}
		}

		// Set the end date.
		let endDate = '';
		if (!isNaN(this._endDate.date.year)) {
			try {
				endDate = this._endDate.date.toString();
			}
			catch (e) {
				this.setHtmlVariable('feedback', 'Please enter a valid end date.');
				return;
			}
		}

		// Get the min and max amounts.
		const minAmount = filterInputs.minAmount;
		const maxAmount = filterInputs.maxAmount;

		// Get the search.
		const search = filterInputs.search;

		this._app.router.pushQuery({
			page: this._app.router.getValue('page'),
			name: this._app.router.getValue('name'),
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
		<DateChooser id="startDate" class="right"></DateChooser>
		<label for="endDate" class="left">End date:</label>
		<DateChooser id="endDate" class="right"></DateChooser>
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
