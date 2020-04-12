export class Account {
	/** The id. */
	public id = '';

	/** The name. */
	public name = '';

	/** The currency. */
	public currency: string | undefined;

	/** The parent. */
	public parent?: string;

	/** The children. */
	public children?: Account[];
}
