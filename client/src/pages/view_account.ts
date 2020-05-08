import { Component, ShowHide } from '../../../../app-ts/src/index';
import { Financio, Account, NiceForm, YMD, Transaction } from '../internal';

/** The view accounts page. */
export class ViewAccount extends Financio.Page {
	/** The id of the account to view. */
	private _id: string;

	constructor(params: Component.Params) {
		super(params);

		// Set the name of the account.
		this._id = this.app.router.getValue('id') || '';

		this.app.nav(this, /*html*/`<button onclick="{{_goToListAccounts}}">Accounts</button>`);

		// Add a callback to update the transactions from the query.
		this._updateTransactionsFromQuery = this._updateTransactionsFromQuery.bind(this);
		this.app.router.addCallback(this._updateTransactionsFromQuery);

		this._updateTransactionsFromQuery();

		// Get the info on the account.
		this.app.server.send({
			command: 'list accounts'
		}).then((accounts: Account[]) => {
			const account = Account.getById(accounts, this._id);
			this._populateAccountInfo(account);
		});
	}

	__destroy() {
		this.app.router.removeCallback(this._updateTransactionsFromQuery);
		super.__destroy();
	}

	private _populateAccountInfo(account: Account | undefined): void {
		if (account === undefined) {
			this.app.message('The account could not be found.');
			this.__element('accountName').innerHTML = 'Unknown';
			return;
		}
		this.__element('accountName').innerHTML = account.name;
		if (account.children !== undefined) { // A group account.
			this.__element('accountInfo').innerHTML = '<p>This is a group account.</p>';
		}
	}

	private _toggleMenu() {
		ShowHide.toggle(this.__element('menu'));
	}

	private _updateTransactionsFromQuery() {
		const niceForm = this.__component('filterForm') as NiceForm;

		// Set the start and end dates from the query.
		const today = new YMD();
		const startDate = this.app.router.getValue('startDate') || new YMD(today.year, today.month - 3, today.day).toString();
		const endDate = this.app.router.getValue('endDate') || today.toString();
		niceForm.setValue('startDate', startDate);
		niceForm.setValue('endDate', endDate);

		// Set the min and max amounts from the query.
		let minAmount: string | number | undefined = this.app.router.getValue('minAmount');
		let maxAmount: string | number | undefined = this.app.router.getValue('maxAmount');
		if (minAmount !== undefined) {
			niceForm.setValue('minAmount', minAmount);
			minAmount = parseFloat(minAmount);
		}
		if (maxAmount !== undefined) {
			niceForm.setValue('maxAmount', maxAmount);
			maxAmount = parseFloat(maxAmount);
		}

		// Set the search from the query.
		const search = this.app.router.getValue('search');
		if (search !== undefined) {
			niceForm.setValue('search', search);
		}

		// Update the transactions.
		this.app.server.send({
			command: 'list transactions',
			id: this.app.router.getValue('id'),
			startDate: startDate.toString(),
			endDate: endDate.toString(),
			minAmount: minAmount,
			maxAmount: maxAmount,
			search: search
		}).then((transactions: Transaction[]) => {
			console.log(transactions);
		});
		// (this.__component('transactionList') as TransactionList).transactions = transactions;
	}

	private _toggleFilterForm() {
		const filterForm = this.__element('filterForm');
		ShowHide.toggle(filterForm);
	}

	/**
	 * Updates the list of transactions.
	 * @private
	 */
	private async _updateQueryFromFilterForm(results: NiceForm.Results) {
		console.log(results);
		// Set the start date.
		let startDate = '';
		const startDateAsDate = new YMD(results.startDate as string);
		if (!isNaN(startDateAsDate.year)) {
			// Get the date inputs and parse them as Date objects.
			try {
				startDate = startDateAsDate.toString();
			}
			catch (e) {
				throw new Error('Please enter a valid start date.');
			}
		}

		// Set the end date.
		let endDate = '';
		const endDateAsDate = new YMD(results.endDate as string);
		if (!isNaN(endDateAsDate.year)) {
			try {
				endDate = endDateAsDate.toString();
			}
			catch (e) {
				throw new Error('Please enter a valid end date.');
			}
		}

		// Get the min and max amounts.
		const minAmount = results.minAmount as string;
		const maxAmount = results.maxAmount as string;

		// Get the search.
		const search = results.search as string;

		// Do the query.
		this.app.router.pushQuery({
			page: this.app.router.getValue('page') || '',
			id: this.app.router.getValue('id') || '',
			startDate: startDate,
			endDate: endDate,
			minAmount: minAmount,
			maxAmount: maxAmount,
			search: search });
	}

	private _goToImportTransactions() {
		this.app.router.pushQuery({
			page: 'importTransactions',
			id: this._id
		});
	}

	private _goToListAccounts(): void {
		this.app.router.pushQuery({
			page: 'listAccounts'
		});
	}

	private _goToRenameAccount(): void {
		this.app.router.pushQuery({
			page: 'renameAccount',
			id: this._id
		});
	}

	private _goToDeleteAccount(): void {
		this.app.router.pushQuery({
			page: 'deleteAccount',
			id: this._id
		});
	}
}

ViewAccount.html = /*html*/`
	<div>
		<h1 ref="accountName"></h1>
		<button ref="menuButton" onclick="{{_toggleMenu}}"><icon src="assets/svgs/menu.svg"/></button>
		<div ref="menu" style="display: none;">
			<p><button onclick="{{_goToRenameAccount}}">Rename</button></p>
			<p><button onclick="{{_goToDeleteAccount}}">Delete</button></p>
			<p><button onclick="{{_goToImportTransactions}}">Import Transactions</button></p>
		</div>
		<div ref="accountInfo"></div>
		<p>
			<button ref="filterButton" onclick="{{_toggleFilterForm}}"><icon src="assets/svgs/filter.svg"></icon></button>
		</p>
		<NiceForm ref="filterForm" style="display: block" submitText="Update" onSubmit="{{_updateQueryFromFilterForm}}">
			<Entry name="startDate" type="date">Start date</Entry>
			<Entry name="endDate" type="date">End date</Entry>
			<Entry name="minAmount">Minimum amount</Entry>
			<Entry name="maxAmount">Maximum amount</Entry>
			<Entry name="search">Search</Entry>
		</NiceForm>
		<div ref="transactions">
			<div class="heading">
				<div class="transaction">
					<div class="date">Date</div>
					<div class="description">Description</div>
					<div class="category">Category</div>
					<div class="amount">Amount</div>
				</div>
			</div>
			<div class="rows"></div>
		</div>
	</div>
	`;

ViewAccount.css = /*css*/`
	.ViewAccount [ref="menuButton"] {
		position: absolute;
		top: 0;
		right: 0;
		font-size: 1.5rem;
	}
	.ViewAccount [ref="menu"] {
		position: absolute;
		top: 1.5rem;
		right: 0;
		border: 1px solid var(--fg-light);
		border-radius: 0 0 .25rem .25rem;
		padding: .5rem;
		text-align: right;
	}
	.ViewAccount .transaction {
		width: 100%;
		display: grid;
		grid-template-columns: 7rem 29rem 6rem 8rem;
		grid-template-rows: 1.5rem;
		grid-template-areas:
			"date description category amount";
	}
	.ViewAccount .transaction .date {
		grid-area: date;
		text-align: left;
		line-height: 1.5rem;
		padding-left: .125rem;
	}
	.ViewAccount .transaction .description {
		grid-area: description;
		text-align: left;
		line-height: 1.5rem;
		overflow: hidden;
		padding-left: .125rem;
	}
	.ViewAccount .transaction .amount {
		grid-area: amount;
		text-align: right;
		line-height: 1.5rem;
		padding-right: .125rem;
	}
	.ViewAccount .transaction .category {
		grid-area: category;
		text-align: left;
		line-height: 1.5rem;
		padding-right: .125rem;
	}
	.ViewAccount .rows .even {
		background: var(--bg-medium);
		color: var(--bg-light);
	}
	@media (max-width: 52rem) {
		.ViewAccount .heading {
			display: none;
		}
		.ViewAccount .transaction {
			grid-template-columns: 7rem 1fr 8rem;
			grid-template-rows: 1.5rem 1.5rem;
			grid-template-areas:
			"date description amount"
			". category category";
		}
	}
	@media (max-width: 46rem) {
		.ViewAccount .heading {
			display: none;
		}
		.ViewAccount .transaction {
			grid-template-columns: 7rem 1fr;
			grid-template-rows: 1.5rem 1.5rem;
			grid-template-areas:
			"date description"
			"category amount";
		}
	}
	@media (max-width: 38rem) {
		.ViewAccount .transaction {
			grid-template-columns: 7rem 6rem 1fr;
			grid-template-rows: 1.5rem 1.5rem;
			grid-template-areas:
				"description description description"
				"date category amount";
		}
		.ViewAccount .transaction .category {
			text-align: left;
		}
	}
	`;

ViewAccount.register();
