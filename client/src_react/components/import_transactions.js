import React from 'react';
import './import_transactions.css';
import Transaction from '../../../src/transaction';
import TransactionList from './transaction_list';
/** @typedef {import('../../../../app-js/src/router').default} Router */
/** @typedef {import('../../../../app-js/src/ws').default} WS */

/**
 * @typedef Props
 * @property {Router} router
 * @property {WS} server
 */

/**
 * The transactions page.
 * @extends {React.Component<Props>}
 */
export default class ImportTransactions extends React.Component {
	/**
	 * Constructs the app.
	 * @param {Props} props
	 */
	constructor(props) {
		super(props);

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
	}

	render() {
		let stepHTML = '';
		if (this.state.step === 1) {
			stepHTML = <>
				<h2>Step 1 - Load Data</h2>
				</>;
			if (this.state.files.length === 0) {
				stepHTML = <>{stepHTML}
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
					</>;
			}
			else {
				for (const file of this.state.files) {
					stepHTML = <>{stepHTML}
						<p>{file.name}</p>
						</>;
				}
			}
			stepHTML = <>{stepHTML}
				<p><button onClick={this.nextStep}>Next</button></p>
				</>;
		}
		else if (this.state.step === 2) {
			stepHTML = <>
				<h2>Step 2 - Configure It</h2>
				<p>// Check box to automatically apply rules or not. (defaults to true)</p>
				<p><button onClick={this.nextStep}>Next</button></p>
				</>;
		}
		else if (this.state.step === 3) {
			stepHTML = <>
				<h2>Step 3 - Review the Transactions</h2>
				<h3>New Transactions</h3>
				<TransactionList transactions={this.state.newTransactions} />
				<h3>Duplicate Transactions (will not be overwritten)</h3>
				<TransactionList transactions={this.state.duplicateTransactions} />
				<p><button onClick={this.nextStep}>Finish</button></p>
				</>;
		}
		return <>
			<h1>Import Transactions</h1>
			{stepHTML}
			<div>{this.state.feedback}</div>
			</>;
	}

	nextStep() {
		if (this.state.step === 2) {
			this.loadTransactions(this.state.files);
		}
		if (this.state.step < 3) {
			this.setState((state) => {
				return {
					step: state.step + 1
				};
			});
		}
		else { // Last step, so submit it all.
			this.props.server.send({
				command: 'add transactions',
				name: this.props.router.getValueOf('name'),
				transactions: this.state.newTransactions
			}).then(() => {
				this.props.router.push({
					page: 'viewAccount',
					name: this.props.router.getValueOf('name')
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
		this.setState({
			files: this.fileInput.current.files
		});
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
			name: this.props.router.getValueOf('name'),
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
