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

	public static getById(accounts: Account[], id: string): Account | undefined {
		for (let i = 0, l = accounts.length; i < l; i++) {
			const account = accounts[i];
			if (account.id === id) {
				return account;
			}
			else if (account.children !== undefined) {
				return this.getById(account.children, id);
			}
		}
		return undefined;
	}

	public static surroundByText(accounts: Account[], callback: (account: Account, depth: number, childIndex: number, numChildren: number) => string, depth: number = 0): string {
		let text: string = '';
		for (let i = 0, l = accounts.length; i < l; i++) {
			const account = accounts[i];
			text += callback(account, depth, i, l);
			if (account.children !== undefined) {
				text += this.surroundByText(account.children, callback, depth + 1);
			}
		}
		return text;
	}
}
