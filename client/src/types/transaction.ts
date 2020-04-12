export class Transaction {
	/** The date when the transaction was processed, formatted as 'yyyy-mm-dd hh:mm:ss.sss'. */
	public date = '';

	/** The amount in the currency of the account. */
	public amount = Number.NaN;

	/** The description memo from the bank. */
	public description = '';

	/** The unique id from the bank. */
	public id = '';

	/** The category to which the transaction belongs. */
	public category = '';

	/** Additional notes. */
	public notes = '';
}
