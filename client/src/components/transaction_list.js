import { Component } from '../../../../app-js/src/index';
import style from './transaction_list.css';
/** @typedef {import('../../../src/transaction').default} Transaction */

/**
 * A transactions list.
 */
export default class TransactionList extends Component {
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
	}

	set transactions(transactions) {
		const rowsElem = this.get('rows');
		let rowsHtml = ``;
		for (let i = 0, l = transactions.length; i < l; i++) {
			const transaction = transactions[i];
			rowsHtml += `
				<div class="transaction ` + (i % 2 === 0 ? `even` : `odd`) + `">
					<div class="date">` + transaction.date.substr(0, 10) + `</div>
					<div class="description">` + transaction.description + `</div>
					<div class="amount">` + Number.parseFloat(transaction.amount).toFixed(2) + `</div>
					<div class="category">` + transaction.category + `</div>
				</div>`;
		}
		rowsElem.innerHTML = rowsHtml;
	}
}

TransactionList.html = `
	<div class="transaction heading">
		<div class="date">Date</div>
		<div class="description">Description</div>
		<div class="amount">Amount</div>
		<div class="category">Category</div>
	</div>
	<div id="rows"></div>
	`;

TransactionList.style = style;
