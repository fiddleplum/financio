import fs from 'fs';
import crypto from 'crypto';
import { Transaction } from '../../client/src/types/transaction';
import { Account } from '../../client/src/types/account';
import { YMD } from '../../client/src/types/ymd';

export default class AccountUtils {
	/** Sets up the folder structure. */
	static initialize() {
		if (!fs.existsSync('data/accounts/')) {
			fs.mkdirSync('data/accounts/');
		}
	}

	/** Loads the accounts.json file. */
	static loadAccounts(): Account[] {
		try {
			return JSON.parse(fs.readFileSync('data/accounts.json').toString());
		}
		catch (error) {
			throw new Error('The file "data/accounts.json" could not be read. ' + error);
		}
	}

	/** Saves the accounts.json file. */
	static saveAccounts(accounts: Account[]) {
		try {
			fs.writeFileSync('data/accounts.json', JSON.stringify(accounts));
		}
		catch (error) {
			throw new Error('The file "data/accounts.json" could not be written to. ' + error);
		}
	}

	/** Searches recursively to find the account associated with the id. */
	static getAccount(id: string, accounts: Account[]): Account | undefined {
		for (let i = 0; i < accounts.length; i++) {
			if (accounts[i].id === id) {
				return accounts[i];
			}
			const children = accounts[i].children;
			if (children !== undefined) {
				const child = this.getAccount(id, children);
				if (child !== undefined) {
					return child;
				}
			}
		}
		return undefined;
	}

	/** Get a unique id for the account. Source from https://stackoverflow.com/a/2117523/510380. */
	static getUniqueId(): string {
		return '10000000-1000-4000-80000000-100000000000'.replace(/[018]/g, (c: any) => {
			return (c ^ crypto.randomFillSync(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
		});
	}

	/** Gets the list of the accounts. */
	static list(): Account[] {
		return this.loadAccounts();
	}

	/** Creates a new account within the parent group right before the before item. */
	static create(name: string, currency: string, placement: string, isGroup: boolean) {
		// Validate the name.
		if (!this._validateName(name)) {
			throw new Error('The name "' + name + '" is not a valid account name. Please use only alphanumeric, space, underscore, and dash characters.');
		}

		// Validate currency.
		if (currency === '') {
			throw new Error('The currency must be specified.');
		}

		// Load the accounts file.
		const accounts = this.loadAccounts();

		// Create the account object.
		const account: Account = {
			id: this.getUniqueId(),
			name: name,
			currency: currency,
			children: isGroup ? [] : undefined
		};

		// Get the placement account. It can be <beforeId>, end_of_<parentId>, or just end_of_.
		let before = true;
		let placementId = placement;
		if (placementId.startsWith('end_of_')) { // End of the placementId's children.
			placementId = placementId.substring(7);
			before = false;

			if (placementId !== '') {
				const parentAccount = this.getAccount(placementId, accounts);
				if (parentAccount === undefined) {
					throw new Error('Account "' + placementId + '" not found.');
				}
				if (parentAccount.children === undefined) {
					throw new Error('Account "' + placementId + '" is not a group account.');
				}
				// Set the parent of the account.
				account.parent = parentAccount.id;
				// Push it!
				parentAccount.children.push(account);
			}
			else { // End of the root list.
				accounts.push(account);
			}

		}
		else {
			const placementAccount = this.getAccount(placementId, accounts);
			if (placementAccount === undefined) {
				throw new Error('Account "' + placementId + '" not found.');
			}

			// Get the list where the account will be inserted.
			let accountList = accounts;
			if (placementAccount.parent !== undefined) {
				const parentAccount = this.getAccount(placementAccount.parent, accounts);
				if (parentAccount === undefined || parentAccount.children === undefined) {
					throw new Error('The accounts file has been corrupt as "' + placementId + '" + has an invalid parent.');
				}
				accountList = parentAccount.children;
				// Set the parent of the account.
				account.parent = placementAccount.parent;
			}

			// Insert the account.
			for (let i = 0; i < accountList.length; i++) {
				if (placementAccount === accountList[i]) {
					accountList.splice(i, 0, account);
					break;
				}
			}
		}

		// Save the accounts file.
		this.saveAccounts(accounts);

		// Create the data folder.
		try {
			if (!fs.existsSync('data/accounts/' + account.id + '/')) {
				fs.mkdirSync('data/accounts/' + account.id + '/');
			}
		}
		catch (error) {
			throw new Error('The folder "data/accounts/' + account.id + '/" could not be created. ' + error);
		}
	}

	/** Deletes an account. */
	static delete(id: string) {
		// Load the accounts file.
		const accounts = this.loadAccounts();

		// Get the account to be deleted.
		const account = this.getAccount(id, accounts);
		if (account === undefined) {
			throw new Error('The account "' + id + '" does not exist.');
		}

		// Get the parent's account array for deleting the child.
		let deleteArray: Account[];
		if (account.parent !== undefined) {
			const parent = this.getAccount(account.parent, accounts);
			if (parent === undefined || parent.children === undefined) {
				throw new Error('The accounts file has been corrupt as "' + id + '" + has an invalid parent.');
			}
			deleteArray = parent.children;
		}
		else {
			deleteArray = accounts;
		}

		// Delete the account.
		for (let i = 0; i < deleteArray.length; i++) {
			if (deleteArray[i].id === account.id) {
				if (account.children !== undefined) {
					// Replace it with its children.
					deleteArray.splice(i, 1, ...account.children);
					for (const child of account.children) {
						child.parent = account.parent;
					}
				}
				else {
					deleteArray.splice(i, 1);
				}
				break;
			}
		}

		// Save the accounts file.
		this.saveAccounts(accounts);

		// Delete all created folders and files for the account.
		const accountFolder = 'data/accounts/' + account.id;
		if (fs.existsSync(accountFolder)) {
			if (fs.existsSync(accountFolder + '/transactions/')) {
				let files = fs.readdirSync(accountFolder + '/transactions/');
				for (let i = 0, l = files.length; i < l; i++) {
					fs.unlinkSync(accountFolder + '/transactions/' + files[i]);
				}
				fs.rmdirSync(accountFolder + '/transactions/');
			}
			fs.rmdirSync(accountFolder);
		}
	}

	/** Rename an account. */
	static rename(id: string, newName: string) {
		// Validate the newName.
		if (!this._validateName(newName)) {
			throw new Error('The name "' + newName + '" is not a valid account name. Please use only alphanumeric, space, underscore, and dash characters.');
		}

		// Load the accounts file.
		const accounts = this.loadAccounts();

		// Rename the account JSON.
		const account = this.getAccount(id, accounts);
		if (account === undefined) {
			throw new Error('The account "' + id + '" does not exist.');
		}
		account.name = newName;

		// Save the accounts file.
		this.saveAccounts(accounts);
	}

	/** Views an account. */
	static view(id: string) {
		// Load the accounts file.
		const accounts = this.loadAccounts();

		// Get the account.
		const account = this.getAccount(id, accounts);
		if (account === undefined) {
			throw new Error('The account "' + id + '" does not exist.');
		}
		return account;
	}

	/** Gets a list of the transactions. */
	static listTransactions(id: string, startDate: string, endDate: string, search: string | undefined, minAmount: number | undefined, maxAmount: number | undefined) {
		// Load the accounts file.
		const accounts = this.loadAccounts();

		// Get the account.
		const account = this.getAccount(id, accounts);
		if (account === undefined) {
			throw new Error('The account "' + id + '" does not exist.');
		}

		// Prepare the regular expression for searching.
		let regExp = /.*/;
		if (search !== undefined) {
			if (/^\/[^/]*\/[a-z]*$/.test(search)) {
				const lastSlashIndex = search.lastIndexOf('/');
				regExp = new RegExp(search.substr(1, lastSlashIndex - 1), search.substr(lastSlashIndex + 1));
				console.log(regExp);
			}
			else {
				regExp = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
			}
		}

		// Prepare the min and max amounts.
		if (minAmount === undefined) {
			minAmount = Number.NEGATIVE_INFINITY;
		}
		else {
			minAmount = minAmount;
		}
		if (maxAmount === undefined) {
			maxAmount = Number.POSITIVE_INFINITY;
		}
		else {
			maxAmount = maxAmount;
		}

		let transactions: Transaction[] = [];
		const accountFolder = 'data/accounts/' + id;
		if (fs.existsSync(accountFolder + '/transactions/')) {
			const start = new YMD(startDate);
			const end = new YMD(endDate);
			const current = new YMD(start);
			current.day = 1;
			while (current <= end) {
				const filePath = this.getTransactionsFilePath(accountFolder, current);
				if (fs.existsSync(filePath)) {
					const newTransactions: Transaction[] = JSON.parse(fs.readFileSync(filePath).toString());
					for (let i = 0, l = newTransactions.length; i < l; i++) {
						const newTransaction = newTransactions[i];
						const transactionDate = new YMD(newTransaction.date);
						console.log(transactionDate + ' ' + start + ' ' + end);
						if (transactionDate < start || end < transactionDate) {
							continue;
						}
						console.log('here1');
						if (!regExp.test(newTransaction.description) && !regExp.test(newTransaction.notes)) {
							continue;
						}
						console.log('here2');
						console.log((typeof newTransaction.amount) + ' ' + typeof(minAmount) + ' ' + typeof(maxAmount));
						if (newTransaction.amount < minAmount || maxAmount < newTransaction.amount) {
							continue;
						}
						console.log('here3');
						transactions.push(newTransaction);
					}
				}
				current.month += 1;
			}
		}
		return transactions;
	}

	/** Returns a pair of lists of transactions, the first being new transactions and the second duplicates. */
	static checkDuplicateTransactions(id: string, transactions: Transaction[]): [Transaction[], Transaction[]] {
		// Get the account folder.
		const accountFolder = 'data/accounts/' + id;

		const newTransactions: Transaction[] = [];
		const duplicateTransactions: Transaction[] = [];

		let currentTransactionsFilePath = '';
		let currentTransactions: Transaction[] | null = null;
		for (let transaction of transactions) {
			const date = new YMD(transaction.date);
			const transactionFilePath = this.getTransactionsFilePath(accountFolder, date);
			if (currentTransactionsFilePath !== transactionFilePath) {
				if (currentTransactions !== null) {
					this.sortTransactions(currentTransactions);
					// fs.writeFileSync(currentTransactionsFilePath, JSON.stringify(currentTransactions));
				}
				currentTransactionsFilePath = transactionFilePath;
				if (!fs.existsSync(currentTransactionsFilePath)) {
					// fs.writeFileSync(currentTransactionsFilePath, '');
					currentTransactions = [];
				}
				else {
					currentTransactions = JSON.parse(fs.readFileSync(currentTransactionsFilePath).toString());
				}
			}

			// Check for a duplicate id.
			let duplicateFound = false;
			if (currentTransactions !== null) {
				for (let otherTransaction of currentTransactions) {
					if (otherTransaction.id !== transaction.id) {
						duplicateFound = true;
					}
				}
			}
			if (duplicateFound) {
				duplicateTransactions.push(transaction);
			}
			else {
				newTransactions.push(transaction);
			}
		}
		return [newTransactions, duplicateTransactions];
	}

	/** Adds a list of transactions to the existing transactions. Ignored transactions with duplicate ids. */
	static addTransactions(id: string, transactions: Transaction[]) {
		// Get the account folder.
		const accountFolder = 'data/accounts/' + id;

		// If the transactions folder doesn't already exist, create it.
		if (!fs.existsSync(accountFolder + '/transactions/')) {
			fs.mkdirSync(accountFolder + '/transactions/');
		}

		let currentTransactionsFilePath = '';
		let currentTransactions: Transaction[] | null = null;
		for (let transaction of transactions) {
			const date = new YMD(transaction.date);
			const transactionFilePath = this.getTransactionsFilePath(accountFolder, date);
			if (currentTransactionsFilePath !== transactionFilePath) {
				if (currentTransactions !== null) {
					this.sortTransactions(currentTransactions);
					fs.writeFileSync(currentTransactionsFilePath, JSON.stringify(currentTransactions));
				}
				currentTransactionsFilePath = transactionFilePath;
				if (!fs.existsSync(currentTransactionsFilePath)) {
					fs.writeFileSync(currentTransactionsFilePath, '');
					currentTransactions = [];
				}
				else {
					currentTransactions = JSON.parse(fs.readFileSync(currentTransactionsFilePath).toString());
				}
			}

			// Check for a duplicate id.
			if (currentTransactions !== null) {
				let duplicateFound = false;
				for (let otherTransaction of currentTransactions) {
					if (otherTransaction.id === transaction.id) {
						duplicateFound = true;
					}
				}
				if (!duplicateFound) {
					currentTransactions.push(transaction);
				}
			}
		}
		if (currentTransactions !== null) {
			this.sortTransactions(currentTransactions);
			fs.writeFileSync(currentTransactionsFilePath, JSON.stringify(currentTransactions));
		}
	}

	/** Validates the account name. */
	static _validateName(name: string): boolean {
		if (name !== name.replace(/[^\w- _']/, '') || name.length === 0) {
			return false;
		}
		return true;
	}

	/** Gets the file path of a given transaction file given a date. */
	static getTransactionsFilePath(accountFolder: string, date: YMD): string {
		return accountFolder + '/transactions/' + date.year.toString().padStart(4, '0') + date.month.toString().padStart(2, '0') + '.json';
	}

	static sortTransactions(transactions: Transaction[]) {
		transactions.sort(function (a: Transaction, b: Transaction) {
			if (a.date < b.date) {
				return -1;
			}
			if (b.date > a.date) {
				return +1;
			}
			if (a.id < b.id) {
				return -1;
			}
			if (a.id > b.id) {
				return +1;
			}
			return 0;
		});
	}
}
