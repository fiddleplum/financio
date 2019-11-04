import { Component } from '../../../../app-js/src/index';
import TransactionList from './transaction_list';
import style from './import_transactions.css';
/** @typedef {import('../../../src/transaction').default} Transaction */
/** @typedef {import('../financio').default} Financio */

/**
 * The import transactions page.
 */
export default class ImportTransactions extends Component {
	/**
	 * Constructs the app.
	 * @param {HTMLElement} elem - The element inside which thee the component will reside.
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
		 * @type {string}
		 * @private
		 */
		this._files = [];

		this.state = {
			/** @type {Transaction[]} */
			files: [],
			newTransactions: [],
			duplicateTransactions: [],
			step: 1,
			feedback: ''
		};

		this.fileInput = React.createRef();
		this.nextStep = this.nextStep.bind(this);
		this.onUpload = this.onUpload.bind(this);
		this.onDrop = this.onDrop.bind(this);

		let stepHTML = '';
		if (this._step === 1) {
			stepHTML = `
				<h2>Step 1 - Load Data</h2>
				<p>If your device supports drag and drop, you can drag the files into the box below.</p>
				<p className="importBox">Drag File Here</p>
				<p>Or you can upload files here below.</p>
				<form>
				<p><input type="file" id="fileInput" multiple /></p>
				</form>
				<p><button onClick={this.nextStep}>Next</button></p>`;
		}
		else if (this._step === 2) {
			stepHTML = <>
				<h2>Step 2 - Configure It</h2>
				<p>// Check box to automatically apply rules or not. (defaults to true)</p>
				<p><button onClick={this.nextStep}>Next</button></p>
				</>;
		}
		else if (this._step === 3) {
			stepHTML = <>
				<h2>Step 3 - Review the Transactions</h2>
				<h3>New Transactions</h3>
				<TransactionList transactions={this._newTransactions} />
				<h3>Duplicate Transactions (will not be overwritten)</h3>
				<TransactionList transactions={this._duplicateTransactions} />
				<p><button onClick={this.nextStep}>Finish</button></p>
				</>;
		}
		return <>
			<h1>Import Transactions</h1>
			{stepHTML}
			<div>{this._feedback}</div>
			</>;

		this.on('importBox', 'onDragOver', (event) => {
			event.stopPropagation();
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
		});
		this.on('importBox', 'onDrop', this.onDrop);
		this.on('fileInput', 'onChange', this.onUpload);
		this.on('
	}

	nextStep() {
		if (this._step === 2) {
			this.loadTransactions(this._files);
		}
		if (this._step < 3) {
			this.setState((state) => {
				return {
					step: _step + 1
				};
			});
		}
		else { // Last step, so submit it all.
			this.props.server.send({
				command: 'add transactions',
				name: this.props.router.getValue('name'),
				transactions: this._newTransactions
			}).then(() => {
				this.props.router.pushQuery({
					page: 'viewAccount',
					name: this.props.router.getValue('name')
				});
			}).catch((error) => {
				this.setState({
					feedback: error.message
				});
			});
		}
	}

	onUpload(event) {
		event.stopPropagation();
		event.preventDefault();
		this._files = this.get('fileInput').files;
		});
		for (const file of this._files) {
			stepHTML = <>{stepHTML}
				<p>{file.name}</p>
				</>;
		}
	}

	onDrop(event) {
		event.stopPropagation();
		event.preventDefault();
		const files = [];
		this.setState({
			files: event.dataTransfer.files
		});
	}

	async loadTransactions(files) {
		const transactions = [];
		const promises = [];
		for (let i = 0, l = files.length; i < l; i++) {
			const file = files[i];
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
		this.props.server.send({
			command: 'check duplicate transactions',
			name: this.props.router.getValue('name'),
			transactions: transactions
		}).then((result) => {
			this.setState({
				newTransactions: result[0],
				duplicateTransactions: result[1]
			});
		});
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

render() {

ImportTransactions.html = `
<h1>Import Transactions</h1>
	<div id="step1">
		<h2>Step 1 - Load Data</h2>
		<p>If your device supports drag and drop, you can drag the files into the box below.</p>
		<p className="importBox" onDragOver={(event) => {
			event.stopPropagation();
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
		}} onDrop={this.onDrop}>Drag File Here</p>
		<p>Or you can upload files here below.</p>
		<form>
		<p><input type="file" ref={this.fileInput} onChange={this.onUpload} multiple /></p>
		</form>
		</div>
		<div id="step2">
			<h2>Step 2 - Configure It</h2>
			<p>// Check box to automatically apply rules or not. (defaults to true)</p>
			<p><button onClick={this.nextStep}>Next</button></p>
		</div>
		<div id="step3">
			<h2>Step 3 - Review the Transactions</h2>
			<h3>New Transactions</h3>
			<TransactionList transactions={this._newTransactions} />
			<h3>Duplicate Transactions (will not be overwritten)</h3>
			<TransactionList transactions={this._duplicateTransactions} />
			<p><button onClick={this.nextStep}>Finish</button></p>
		</div>
		<div>{this._feedback}</div>
	`;