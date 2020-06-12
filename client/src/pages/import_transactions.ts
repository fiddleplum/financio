import { Component } from '../../../../app-ts/src/index';
import { Financio, Transaction, TransactionList, NiceForm } from '../internal';

/** The import transactions page. */
export class ImportTransactions extends Financio.Page {
	/** The step the user is on. */
	private _step: number = 1;

	/** The list of files to be uploaded. */
	private _files: FileList | null = null;

	/** The list of new transactions to import. */
	private _newTransactions: Transaction[] = [];

	/** The list of duplicate transactions that will not be imported. */
	private _duplicateTransactions: Transaction[] = [];

	constructor(params: Component.Params) {
		super(params);

		// Enable step 1.
		this.__element('step1').style.display = 'block';
	}

	_nextStep() {
		if (this._step === 1) {
			this.__element('step1').style.display = '';
			this.__element('step2').style.display = 'block';
			this._step += 1;
		}
		else if (this._step === 2) {
			this.__element('step2').style.display = '';
			this.__element('step3').style.display = 'block';
			this._loadTransactions();
			this._step += 1;
		}
		else if (this._step === 3) {
			this.app.server.send({
				command: 'add transactions',
				id: this.app.router.getValue('id'),
				transactions: this._newTransactions
			}).then(() => {
				this.app.router.pushQuery({
					page: 'viewAccount',
					id: this.app.router.getValue('id') || ''
				});
			}).catch((error) => {
				// this.setHtmlVariable('feedback', error.message);
			});
		}
	}

	/**
	 * Loads the transactions in the file list.
	 * @private
	 */
	async _loadTransactions() {
		const transactions: Transaction[] = [];
		const promises = [];
		if (this._files !== null) {
			for (let i = 0, l = this._files.length; i < l; i++) {
				const file = this._files[i];
				const extension = file.name.split('.').pop()?.toLowerCase() || '';
				var reader = new FileReader();
				if (extension === 'qfx' || extension === 'ofx') {
					promises.push(new Promise((resolve) => {
						reader.onload = async (dropEvent) => {
							if (dropEvent.target !== null && typeof dropEvent.target.result === 'string') {
								transactions.push(...this.getTransactionsFromOFX(dropEvent.target.result));
							}
							resolve();
						};
					}));
					reader.readAsText(file); // start reading the file data.
				}
			}
		}
		console.log(transactions);
		await Promise.all(promises);
		this.app.server.send({
			command: 'check duplicate transactions',
			id: this.app.router.getValue('id'),
			transactions: transactions
		}).then((result) => {
			console.log('here');
			this._newTransactions = result[0];
			this._duplicateTransactions = result[1];
			(this.__component('newTransactions') as TransactionList).transactions = this._newTransactions;
			(this.__component('duplicateTransactions') as TransactionList).transactions = this._duplicateTransactions;
		});
	}

	_onUpload(event: Event) {
		event.stopPropagation();
		event.preventDefault();
		const fileInputElement = this.__element('fileInput') as HTMLInputElement
		this._setFiles(fileInputElement.files);
	}

	_onDragOver(event: DragEvent) {
		event.stopPropagation();
		event.preventDefault();
		if (event.dataTransfer !== null) {
			event.dataTransfer.dropEffect = 'copy';
		}
	}

	_onDrop(event: DragEvent) {
		event.stopPropagation();
		event.preventDefault();
		if (event.dataTransfer !== null) {
			this._setFiles(event.dataTransfer.files);
		}
	}

	_setFiles(fileList: FileList | null) {
		this._files = fileList;
		let fileListHtml = '';
		if (fileList !== null) {
			for (const file of fileList) {
				fileListHtml += `<p>${file.name}</p>`;
			}
		}
		const fileListElement = this.__element('fileList');
		this.__setHtml(fileListElement, this, fileListHtml);
		this._nextStep();
	}

	/** Returns a list of transactions imported from an OFX file. */
	getTransactionsFromOFX(content: string): Transaction[] {
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
				transaction.amount = parseFloat(content.substr(amountI, content.indexOf('<', amountI) - amountI).trim());
				if (nameI < endI) {
					transaction.description = content.substr(nameI, content.indexOf('<', nameI) - nameI).trim();
				}
				transactions.push(transaction);
			}
		}
		return transactions;
	}
}

ImportTransactions.html = /*html*/`
	<div>
		<h1>Import Transactions</h1>
		<div ref="step1">
			<h2>Step 1 - Choose Files</h2>
			<p>If your device supports drag and drop, you can drag the files into the box below.</p>
			<p ref="importBox" onDragOver="{{_onDragOver}}" onDrop="{{_onDrop}}">Drag File Here</p>
			<p>Or you can upload files here below.</p>
			<form>
				<p><input type="file" onChange="{{_onUpload}}" multiple /></p>
			</form>
		</div>
		<div ref="step2">
			<h2>Step 2 - Configure the Options</h2>
			<div ref="fileList"></div>
			<p>// Check box to automatically apply rules or not. (defaults to true)</p>
			<p><button onClick="{{_nextStep}}">Next</button></p>
		</div>
		<div ref="step3">
			<h2>Step 3 - Review the Transactions</h2>
			<h3>New Transactions</h3>
			<div ref="newTransactions">
				<div class="heading">
					<div class="transaction">
						<div class="id">ID</div>
						<div class="date">Date</div>
						<div class="description">Description</div>
						<div class="amount">Amount</div>
					</div>
				</div>
				<div ref="rows"></div>
			</div>
			<h3>Duplicate Transactions (will not be overwritten)</h3>
			<div ref="duplicateTransactions">
				<div class="heading">
					<div class="transaction">
						<div class="id">ID</div>
						<div class="date">Date</div>
						<div class="description">Description</div>
						<div class="amount">Amount</div>
					</div>
				</div>
				<div ref="rows"></div>
			</div>
			<p><button onClick="{{_nextStep}}">Finish</button></p>
		</div>
		<div ref="feedback"></div>
	</div>
	`;

ImportTransactions.css = /*css*/`
	.ImportTransactions [ref=step1],
	.ImportTransactions [ref=step2],
	.ImportTransactions [ref=step3] {
		display: none;
	}

	.ImportTransactions [ref=importBox] {
		width: 16rem;
		max-width: 100%;
		height: 8rem;
		border: 1px dashed var(--fg-light);
		text-align: center;
		line-height: 8rem;
	}
	`;

ImportTransactions.register();
