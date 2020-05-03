import { Component, ShowHide } from '../../../../app-ts/src/index';
import { Financio, TransactionList, DateChooser, YMD, Transaction } from '../internal';

/** The transactions component. */
export class Transactions extends Component {
	private _app: Financio;

	constructor(params: Component.Params) {
		super(params);

		// Get Financio.
		const financio = params.attributes.get('app');
		if (!(financio instanceof Financio)) {
			throw new Error('While constructing component, app is not Financio.');
		}
		this._app = financio;

		this._updateFromQuery = this._updateFromQuery.bind(this);

		this._updateFromQuery();

		this._app.router.addCallback(this._updateFromQuery);
	}

	__destroy() {
		this._app.router.removeCallback(this._updateFromQuery);
		super.__destroy();
	}

	private async _updateFromQuery() {
		// Set the start and end dates from the query.
		const startDateQuery = this._app.router.getValue('startDate');
		const endDateQuery = this._app.router.getValue('endDate');
		const today = new YMD();
		let startDate: YMD;
		let endDate: YMD;
		if (startDateQuery) {
			startDate = new YMD(startDateQuery);
		}
		else {
			startDate = new YMD(today.year, today.month - 3, today.day);
		}
		if (endDateQuery) {
			endDate = new YMD(endDateQuery);
		}
		else {
			endDate = today;
		}

		// Set the components.
		(this.__component('startDate') as DateChooser).date = startDate;
		(this.__component('endDate') as DateChooser).date = endDate;

		// Set the min and max amounts from the query.
		const minAmount = this._app.router.getValue('minAmount') || '';
		const maxAmount = this._app.router.getValue('maxAmount') || '';
		(this.__element('minAmount') as HTMLInputElement).value = minAmount;
		(this.__element('maxAmount') as HTMLInputElement).value = maxAmount;

		// Set the search from the query.
		const search = this._app.router.getValue('search') || '';
		(this.__element('search') as HTMLInputElement).value = search;

		// Update the transactions.
		const transactions: Transaction[] = await this._app.server.send({
			command: 'list transactions',
			name: this._app.router.getValue('name'),
			startDate: startDate.toString(),
			endDate: endDate.toString(),
			minAmount: minAmount,
			maxAmount: maxAmount,
			search: search
		});
		(this.__component('transactionList') as TransactionList).transactions = transactions;
	}

	private _toggleFilterForm() {
		const filterForm = this.__element('filterForm');
		ShowHide.toggle(filterForm);
	}

	private _goToImportTransactions() {
		this._app.router.pushQuery({
			page: 'importTransactions',
			id: this._app.router.getValue('id') || ''
		});
	}

	/**
	 * Updates the list of transactions.
	 * @private
	 */
	private async _updateQueryFromInputs() {
		// Get the form inputs.
		const filterInputs = Transactions.getFormInputs(this.__element('filterForm'));

		// Set the start date.
		let startDate = '';
		const startDateAsDate = (this.__component('startDate') as DateChooser).date;
		if (!isNaN(startDateAsDate.year)) {
			// Get the date inputs and parse them as Date objects.
			try {
				startDate = startDateAsDate.toString();
			}
			catch (e) {
				this._showFeedback('Please enter a valid start date.');
				return;
			}
		}

		// Set the end date.
		let endDate = '';
		const endDateAsDate = (this.__component('endDate') as DateChooser).date;
		if (!isNaN(endDateAsDate.year)) {
			try {
				endDate = endDateAsDate.toString();
			}
			catch (e) {
				this._showFeedback('Please enter a valid end date.');
				return;
			}
		}

		// Get the min and max amounts.
		const minAmount = filterInputs.minAmount as string;
		const maxAmount = filterInputs.maxAmount as string;

		// Get the search.
		const search = filterInputs.search as string;

		// Do the query.
		this._app.router.pushQuery({
			page: this._app.router.getValue('page') || '',
			name: this._app.router.getValue('name') || '',
			startDate: startDate,
			endDate: endDate,
			minAmount: minAmount,
			maxAmount: maxAmount,
			search: search });
	}

	/** Shows the feedback. */
	private _showFeedback(message: string): void {
		const feedbackElem = this.__element('feedback');
		feedbackElem.innerHTML = message;
		feedbackElem.style.opacity = '1';
	}

	/** Converts a date to a string. */
	private _dateToString(date: YMD): string {
		return (date.year + '').padStart(4, '0')
			+ '-' + (date.month + '').padStart(2, '0')
			+ '-' + (date.day + '').padStart(2, '0');
	}
}

Transactions.html = /*html*/`
	<div>
		<p>
			<button id="filterButton" onclick="_toggleFilterForm"><icon src="assets/svgs/filter.svg"></icon></button>
			<button id="importButton" onclick="_goToImportTransactions"><icon src="assets/svgs/import.svg"</icon></button>
		</p>
		<div id="dateChooser"></div>
		<form id="filterForm" style="display: none;" action="javascript:">
			<label for="startDate" class="left">Start date:</label>
			<DateChooser ref="startDate" class="right"></DateChooser>
			<label for="endDate" class="left">End date:</label>
			<DateChooser ref="endDate" class="right"></DateChooser>
			<label for="minAmount" class="left">Minimum amount:</label>
			<input id="minAmount" name="minAmount" type="text" class="right" />
			<label for="maxAmount" class="left">Maximum amount:</label>
			<input id="maxAmount" name="maxAmount" type="text" class="right" />
			<label for="search" class="left">Search:</label>
			<input id="search" name="search" type="text" class="right" />
			<div id="feedback" class="feedback">{{feedback}}</div>
			<button class="submit" onclick="_updateQueryFromInputs">Update</button>
		</form>
		<TransactionList ref="transactionList"></TransactionList>
	</div>
	`;

Transactions.css = /*css*/`
	`;

Transactions.register();
