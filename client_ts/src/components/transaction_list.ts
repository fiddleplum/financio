import { Component } from '../../../../app-ts/src/index';
import { Transaction } from '../internal';

/**
 * A transactions list.
 */
export class TransactionList extends Component {
	constructor(params: Component.Params) {
		super(params);

		// Get the transactions from the attribute.
		const transactions: Transaction[] = params.attributes.get('transactions') as Transaction[];

		let html = '';
		for (let i = transactions.length - 1; i >= 0; i--) {
			const transaction = transactions[i];
			html += `
				<div class="transaction ${i % 2 === 0 ? 'even' : 'odd'}">
					<div class="date">${transaction.date.substr(0, 10)}</div>
					<div class="description">${transaction.description}</div>
					<div class="category">${transaction.category}</div>
					<div class="amount">${transaction.amount.toFixed(2)}</div>
				</div>`;
		}
		this.__setHtml(this.__element('rows'), html);
	}
}

TransactionList.html = `
	<div class="heading">
		<div class="transaction">
			<div class="date">Date</div>
			<div class="description">Description</div>
			<div class="category">Category</div>
			<div class="amount">Amount</div>
		</div>
	</div>
	<div class="rows"></div>
	`;

TransactionList.css = `
	.TransactionList .transaction {
		width: 100%;
		display: grid;
		grid-template-columns: 7rem 29rem 6rem 8rem;
		grid-template-rows: 1.5rem;
		grid-template-areas:
			"date description category amount";
	}
	.TransactionList .transaction .date {
		grid-area: date;
		text-align: left;
		line-height: 1.5rem;
		padding-left: .125rem;
	}
	.TransactionList .transaction .description {
		grid-area: description;
		text-align: left;
		line-height: 1.5rem;
		overflow: hidden;
		padding-left: .125rem;
	}
	.TransactionList .transaction .amount {
		grid-area: amount;
		text-align: right;
		line-height: 1.5rem;
		padding-right: .125rem;
	}
	.TransactionList .transaction .category {
		grid-area: category;
		text-align: left;
		line-height: 1.5rem;
		padding-right: .125rem;
	}
	.TransactionList.rows .even {
		background: var(--bg-medium);
		color: var(--bg-light);
	}
	@media (max-width: 52rem) {
		.TransactionList.heading {
			display: none;
		}
		.TransactionList .transaction {
			grid-template-columns: 7rem 1fr 8rem;
			grid-template-rows: 1.5rem 1.5rem;
			grid-template-areas:
			"date description amount"
			". category category";
		}
	}
	@media (max-width: 46rem) {
		.TransactionList.heading {
			display: none;
		}
		.TransactionList .transaction {
			grid-template-columns: 7rem 1fr;
			grid-template-rows: 1.5rem 1.5rem;
			grid-template-areas:
			"date description"
			"category amount";
		}
	}
	@media (max-width: 38rem) {
		.TransactionList .transaction {
			grid-template-columns: 7rem 6rem 1fr;
			grid-template-rows: 1.5rem 1.5rem;
			grid-template-areas:
				"description description description"
				"date category amount";
		}
		.TransactionList .transaction .category {
			text-align: left;
		}
	}
	`;
