import React from 'react';
import './transaction_list.css';
/** @typedef {import('../../../src/transaction').default} Transaction */

/**
 * @typedef Props
 * @property {Transactions[]} transactions
 */

/**
 * A transactions list.
 * @extends {React.Component<Props>}
 */
export default class TransactionList extends React.Component {
	/**
	 * Constructs the app.
	 * @param {Props} props
	 */
	constructor(props) {
		super(props);
	}

	render() {
		return <div className="TransactionList">
			<div className="transaction heading">
				<div className="date">Date</div>
				<div className="description">Description</div>
				<div className="amount">Amount</div>
				<div className="category">Category</div>
			</div>
			{this.props.transactions.map((transaction, i) => {
				return <div key={transaction.id} className={`transaction ` + (i % 2 === 0 ? `even` : `odd`)}>
					<div className="date">{transaction.date.substr(0, 10)}</div>
					<div className="description">{transaction.description}</div>
					<div className="amount">{Number.parseFloat(transaction.amount).toFixed(2)}</div>
					<div className="category">{transaction.category}</div>
				</div>;
			})}
		</div>;
	}
}
