class Transaction {
	constructor() {
		/**
		 * The date when the transaction was processed, formatted as 'yyyy-mm-dd hh:mm:ss.sss'.
		 * @type {string}
		 */
		this.date = '';

		/**
		 * The amount in the currency of the account.
		 * @type {number}
		 */
		this.amount = Number.NaN;

		/**
		 * The description memo from the bank.
		 * @type {string}
		 */
		this.description = '';

		/**
		 * The unique id from the bank.
		 * @type {string}
		 */
		this.id = '';

		/**
		 * The category to which the transaction belongs.
		 * @type {string}
		 */
		this.category = '';

		/**
		  * Additional notes.
		  * @type {string}
		  */
		this.notes = '';
	}
}

export default Transaction;
