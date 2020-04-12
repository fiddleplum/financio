"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class AccountUtils {
    static initialize() {
        if (!fs_1.default.existsSync('data/accounts/')) {
            fs_1.default.mkdirSync('data/accounts/');
        }
    }
    static loadAccounts() {
        try {
            return JSON.parse(fs_1.default.readFileSync('data/accounts.json').toString());
        }
        catch (error) {
            throw new Error('The file "data/accounts.json" could not be read. ' + error);
        }
    }
    static saveAccounts(accounts) {
        try {
            fs_1.default.writeFileSync('data/accounts.json', JSON.stringify(accounts));
        }
        catch (error) {
            throw new Error('The file "data/accounts.json" could not be written to. ' + error);
        }
    }
    static getAccount(id, accounts) {
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
    static getUniqueId() {
        return '10000000-1000-4000-80000000-100000000000'.replace(/[018]/g, (c) => {
            return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
        });
    }
    static list() {
        return this.loadAccounts();
    }
    static create(name, currency, parentId, beforeId, isGroup) {
        if (!this._validateName(name)) {
            throw new Error('The name "' + name + '" is not a valid account name. Please use only alphanumeric, space, underscore, and dash characters.');
        }
        const accounts = this.loadAccounts();
        const account = {
            id: this.getUniqueId(),
            name: name,
            currency: currency,
            children: isGroup ? [] : undefined
        };
        let insertArray;
        let parent;
        if (parentId !== undefined) {
            parent = this.getAccount(parentId, accounts);
            if (parent === undefined) {
                throw new Error('Parent "' + parentId + '" not found.');
            }
            if (parent.children === undefined) {
                throw new Error('Parent "' + parentId + '" is not a group account.');
            }
            account.parent = parent.id;
            insertArray = parent.children;
        }
        else {
            insertArray = accounts;
        }
        if (beforeId !== undefined) {
            let beforeIndex;
            for (let i = 0; i < insertArray.length; i++) {
                if (insertArray[i].id === beforeId) {
                    beforeIndex = i;
                }
            }
            if (beforeIndex === undefined) {
                throw new Error('Account "' + beforeId + '" was not found as a child of "' + parentId + '".');
            }
            insertArray.splice(beforeIndex, 0, account);
        }
        else {
            insertArray.push(account);
        }
        this.saveAccounts(accounts);
        try {
            if (!fs_1.default.existsSync('data/accounts/' + account.id + '/')) {
                fs_1.default.mkdirSync('data/accounts/' + account.id + '/');
            }
        }
        catch (error) {
            throw new Error('The folder "data/accounts/' + account.id + '/" could not be created. ' + error);
        }
    }
    static delete(id) {
        const accounts = this.loadAccounts();
        const account = this.getAccount(id, accounts);
        if (account === undefined) {
            throw new Error('The account "' + id + '" does not exist.');
        }
        let deleteArray;
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
        for (let i = 0; i < deleteArray.length; i++) {
            if (deleteArray[i].id === account.id) {
                deleteArray.splice(i, 1);
                break;
            }
        }
        this.saveAccounts(accounts);
        const accountFolder = 'data/accounts/' + account.id;
        if (fs_1.default.existsSync(accountFolder)) {
            if (fs_1.default.existsSync(accountFolder + '/transactions/')) {
                let files = fs_1.default.readdirSync(accountFolder + '/transactions/');
                for (let i = 0, l = files.length; i < l; i++) {
                    fs_1.default.unlinkSync(accountFolder + '/transactions/' + files[i]);
                }
                fs_1.default.rmdirSync(accountFolder + '/transactions/');
            }
            fs_1.default.rmdirSync(accountFolder);
        }
    }
    static rename(id, newName) {
        if (!this._validateName(newName)) {
            throw new Error('The name "' + newName + '" is not a valid account name. Please use only alphanumeric, space, underscore, and dash characters.');
        }
        const accounts = this.loadAccounts();
        const account = this.getAccount(id, accounts);
        if (account === undefined) {
            throw new Error('The account "' + id + '" does not exist.');
        }
        account.name = newName;
        this.saveAccounts(accounts);
    }
    static view(id) {
        const accounts = this.loadAccounts();
        const account = this.getAccount(id, accounts);
        if (account === undefined) {
            throw new Error('The account "' + id + '" does not exist.');
        }
        return account;
    }
    static listTransactions(id, startDate, endDate, search, minAmount, maxAmount) {
        const accounts = this.loadAccounts();
        const account = this.getAccount(id, accounts);
        if (account === undefined) {
            throw new Error('The account "' + id + '" does not exist.');
        }
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
        let transactions = [];
        const accountFolder = 'data/accounts/' + id;
        if (fs_1.default.existsSync(accountFolder + '/transactions/')) {
            let date = new Date(startDate);
            const end = new Date(endDate);
            end.setUTCDate(end.getUTCDate() + 1);
            while (date.getTime() < end.getTime()) {
                const filePath = this.getTransactionsFilePath(accountFolder, date);
                if (fs_1.default.existsSync(filePath)) {
                    const newTransactions = JSON.parse(fs_1.default.readFileSync(filePath).toString());
                    for (let i = 0, l = newTransactions.length; i < l; i++) {
                        const newTransaction = newTransactions[i];
                        if (newTransaction.date < startDate || end.toISOString() <= newTransaction.date) {
                            continue;
                        }
                        if (!regExp.test(newTransaction.description) && !regExp.test(newTransaction.notes)) {
                            continue;
                        }
                        if (newTransaction.amount < minAmount || maxAmount < newTransaction.amount) {
                            continue;
                        }
                        transactions.push(newTransaction);
                    }
                }
                date.setUTCMonth(date.getUTCMonth() + 1);
            }
        }
        return transactions;
    }
    static checkDuplicateTransactions(id, transactions) {
        const accountFolder = 'data/accounts/' + id;
        const newTransactions = [];
        const duplicateTransactions = [];
        let currentTransactionsFilePath = '';
        let currentTransactions = null;
        for (let transaction of transactions) {
            let date = new Date(transaction.date);
            let transactionFilePath = this.getTransactionsFilePath(accountFolder, date);
            if (currentTransactionsFilePath !== transactionFilePath) {
                if (currentTransactions !== null) {
                    this.sortTransactions(currentTransactions);
                    fs_1.default.writeFileSync(currentTransactionsFilePath, JSON.stringify(currentTransactions));
                }
                currentTransactionsFilePath = transactionFilePath;
                if (!fs_1.default.existsSync(currentTransactionsFilePath)) {
                    fs_1.default.writeFileSync(currentTransactionsFilePath, '');
                    currentTransactions = [];
                }
                else {
                    currentTransactions = JSON.parse(fs_1.default.readFileSync(currentTransactionsFilePath).toString());
                }
            }
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
    static addTransactions(id, transactions) {
        const accountFolder = 'data/accounts/' + id;
        if (!fs_1.default.existsSync(accountFolder + '/transactions/')) {
            fs_1.default.mkdirSync(accountFolder + '/transactions/');
        }
        let currentTransactionsFilePath = '';
        let currentTransactions = null;
        for (let transaction of transactions) {
            let date = new Date(transaction.date);
            let transactionFilePath = this.getTransactionsFilePath(accountFolder, date);
            if (currentTransactionsFilePath !== transactionFilePath) {
                if (currentTransactions !== null) {
                    this.sortTransactions(currentTransactions);
                    fs_1.default.writeFileSync(currentTransactionsFilePath, JSON.stringify(currentTransactions));
                }
                currentTransactionsFilePath = transactionFilePath;
                if (!fs_1.default.existsSync(currentTransactionsFilePath)) {
                    fs_1.default.writeFileSync(currentTransactionsFilePath, '');
                    currentTransactions = [];
                }
                else {
                    currentTransactions = JSON.parse(fs_1.default.readFileSync(currentTransactionsFilePath).toString());
                }
            }
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
            fs_1.default.writeFileSync(currentTransactionsFilePath, JSON.stringify(currentTransactions));
        }
    }
    static _validateName(name) {
        if (name !== name.replace(/[^\w- _']/, '') || name.length === 0) {
            return false;
        }
        return true;
    }
    static getTransactionsFilePath(accountFolder, date) {
        return accountFolder + '/transactions/' + date.getUTCFullYear().toString().padStart(4, '0') + (date.getUTCMonth() + 1).toString().padStart(2, '0') + '.json';
    }
    static sortTransactions(transactions) {
        transactions.sort(function (a, b) {
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
exports.default = AccountUtils;
//# sourceMappingURL=account_utils.js.map