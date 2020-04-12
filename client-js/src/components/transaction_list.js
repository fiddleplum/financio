import { Component } from '../../../../app-js/src/index';
import css from './transaction_list.css';
/** @typedef {import('../../../src/transaction').default} Transaction */

/**
 * A transactions list.
 */
export default class TransactionList extends Component {
	set transactions(transactions) {
		let html = ``;
		for (let i = transactions.length - 1; i >= 0; i--) {
			const transaction = transactions[i];
			html += `
				<div class="transaction ${i % 2 === 0 ? 'even' : 'odd'}">
					<div class="date">${transaction.date.substr(0, 10)}</div>
					<div class="description">${transaction.description}</div>
					<div class="category">${transaction.category}</div>
					<div class="amount">${Number.parseFloat(transaction.amount).toFixed(2)}</div>
				</div>`;
		}
		this.setHtml('rows', html);
	}
}

TransactionList.html = `
	<div class="transaction heading">
		<div class="date">Date</div>
		<div class="description">Description</div>
		<div class="category">Category</div>
		<div class="amount">Amount</div>
	</div>
	<div id="rows"></div>
	`;

TransactionList.css = css;
