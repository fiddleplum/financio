import { Component } from '../../../../app-js/src/index';
import html from './import_transactions.html';
import css from './import_transactions.css';
import '../components/transaction_list';
import Transaction from '../../../src/transaction';
/** @typedef {import('../financio').default} Financio */

/**
 * The import transactions page.
 */
export default class ImportTransactions extends Component {
	/**
	 * Constructs the app.
	 * @param {HTMLElement} elem - The element inside which the component will reside.
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

		/**
		 * The step the user is on.
		 * @type {number}
		 * @private
		 */
		this._step = 1;

		/**
		 * The list of files to be uploaded.
		 * @type {FileList}
		 * @private
		 */
		this._files = [];

		/**
		 * The list of new transactions to import.
		 * @type {Transaction[]}
		 * @private
		 */
		this._newTransactions = [];

		/**
		 * The list of duplicate transactions that will not be imported.
		 * @type {Transaction[]}
		 * @private
		 */
		this._duplicateTransactions = [];

		// Enable step 1.
		this.get('step1').style.display = 'block';
	}

	_nextStep() {
		if (this._step === 1) {
			this.get('step1').style.display = '';
			this.get('step2').style.display = 'block';
			this._step += 1;
		}
		else if (this._step === 2) {
			this.get('step2').style.display = '';
			this.get('step3').style.display = 'block';
			this._loadTransactions();
			this._step += 1;
		}
		else if (this._step === 3) {
			this._financio.server.send({
				command: 'add transactions',
				name: this._financio.router.getValue('name'),
				transactions: this._newTransactions
			}).then(() => {
				this._financio.router.pushQuery({
					page: 'viewAccount',
					name: this._financio.router.getValue('name')
				});
			}).catch((error) => {
				this.setHtmlVariable('feedback', error.message);
			});
		}
	}

	/**
	 * Loads the transactions in the file list.
	 * @private
	 */
	async _loadTransactions() {
		const transactions = [];
		const promises = [];
		for (let i = 0, l = this._files.length; i < l; i++) {
			const file = this._files[i];
			const extension = file.name.split('.').pop().toLowerCase();
			var reader = new FileReader();
			if (extension === 'qfx' || extension === 'ofx') {
				promises.push(new Promise((resolve) => {
					reader.onload = async (dropEvent) => {
						transactions.push(...this.getTransactionsFromOFX(dropEvent.target.result));
						resolve();
					};
				}));
				reader.readAsText(file); // start reading the file data.
			}
		}
		await Promise.all(promises);
		this._financio.server.send({
			command: 'check duplicate transactions',
			name: this._financio.router.getValue('name'),
			transactions: transactions
		}).then((result) => {
			this._newTransactions = result[0];
			this._duplicateTransactions = result[1];
			this.getComponent('newTransactions').transactions = this._newTransactions;
			this.getComponent('duplicateTransactions').transactions = this._duplicateTransactions;
		});
	}

	_onUpload(event) {
		event.stopPropagation();
		event.preventDefault();
		this._setFiles(this.get('fileInput').files);
	}

	_onDragOver(event) {
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
	}

	_onDrop(event) {
		event.stopPropagation();
		event.preventDefault();
		this._setFiles(event.dataTransfer.files);
	}

	_setFiles(fileList) {
		this._files = fileList;
		let fileListHtml = '';
		for (const file of this._files) {
			fileListHtml += `<p>${file.name}</p>`;
		}
		this.setHtml('fileList', fileListHtml);
		this._nextStep();
	}

	/**
	 * Returns a list of transactions imported from an OFX file.
	 * @param {string} content
	 * @returns {Transaction[]}
	 * @private
	 */
	getTransactionsFromOFX(content) {
		/** @type {Transaction[]} */
		const transactions = [];
		let i = 0;
		while (i < content.length) {
			i = content.indexOf('<STMTTRN>', i) + '<STMTTRN>'.length;
			if (i === -1 + '<STMTTRN>'.length) {
				break;
			}
			const endI = content.indexOf('</STMTTRN>', i) + '</STMTTRN>'.length;
			const amountI = content.indexOf('<TRNAMT>', i) + '<TRNAMT>'.length;
			const dateI = content.indexOf('<DTPOSTED>', i) + '<DTPOSTED>'.length;
			const nameI = content.indexOf('<NAME>', i) + '<NAME>'.length;
			const idI = content.indexOf('<FITID>', i) + '<FITID>'.length;
			if (idI < endI && dateI < endI && amountI < endI) {
				const transaction = new Transaction();
				transaction.id = content.substr(idI, content.indexOf('<', idI) - idI).trim();
				transaction.date = content.substr(dateI, content.indexOf('<', dateI) - dateI).trim();
				transaction.date = transaction.date.substr(0, 4) + '-' + transaction.date.substr(4, 2) + '-' + transaction.date.substr(6, 2) + 'T00:00:00.000Z';
				transaction.amount = content.substr(amountI, content.indexOf('<', amountI) - amountI).trim();
				if (nameI < endI) {
					transaction.description = content.substr(nameI, content.indexOf('<', nameI) - nameI).trim();
				}
				transactions.push(transaction);
			}
		}
		return transactions;
	}
}

ImportTransactions.html = html;
ImportTransactions.css = css;
