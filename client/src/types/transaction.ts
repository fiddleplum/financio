export class Transaction {
	/** The unique id from the bank. */
	public id = '';

	/** The date when the transaction was processed, formatted as 'yyyy-mm-dd hh:mm:ss.sss'. */
	public date = '';

	/** The amount in the currency of the account. */
	public amount = Number.NaN;

	/** The description memo from the bank. */
	public description = '';

	/** The category to which the transaction belongs. */
	public category = '';

	/** The other account that this transacted. */
	public otherAccount = '';

	/** Additional notes. */
	public notes = '';
}
