import React from 'react';
import TransactionList from './transaction_list';
import FilterSVG from './filter.svg';
import ImportSVG from './import.svg';
/** @typedef {import('../../../src/transaction').default} Transaction */
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
export default class Transactions extends React.Component {
	/**
	 * Constructs the app.
	 * @param {Props} props
	 */
	constructor(props) {
		super(props);

		this.state = {
			filterForm: false,
			/** @type {Transaction[]} */
			transactions: [],
			startYear: '',
			startMonth: '',
			startDay: '',
			endYear: '',
			endMonth: '',
			endDay: '',
			feedback: ''
		};

		const start = this.props.router.getValueOf('start');
		const end = this.props.router.getValueOf('end');
		const today = new Date();

		if (start) {
			this.state.startYear = start.substr(0, 4);
			this.state.startMonth = start.substr(5, 2);
			this.state.startDay = start.substr(8, 2);
		}
		else {
			const threeMonthsBack = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
			this.state.startYear = (threeMonthsBack.getFullYear() + '').padStart(4, '0');
			this.state.startMonth = ((threeMonthsBack.getMonth() + 1) + '').padStart(2, '0');
			this.state.startDay = (threeMonthsBack.getDate() + '').padStart(2, '0');
		}
		if (end) {
			this.state.endYear = end.substr(0, 4);
			this.state.endMonth = end.substr(5, 2);
			this.state.endDay = end.substr(8, 2);
		}
		else {
			this.state.endYear = (today.getFullYear() + '').padStart(4, '0');
			this.state.endMonth = ((today.getMonth() + 1) + '').padStart(2, '0');
			this.state.endDay = (today.getDate() + '').padStart(2, '0');
		}

		this.toggleFilterForm = this.toggleFilterForm.bind(this);
		this.goToImportTransactions = this.goToImportTransactions.bind(this);
		this.formChanged = this.formChanged.bind(this);
		this.submitForm = this.submitForm.bind(this);
	}

	async componentDidMount() {
		await this.update();
	}

	render() {
		return <>
			<button onClick={this.toggleFilterForm}><FilterSVG /></button> <button onClick={this.goToImportTransactions}><ImportSVG /></button>
			{this.state.filterForm ? <form className="filter" action="javascript:void(null);">
				<label htmlFor="startDate" className="left">Start:</label>
				<input name="startDate" type="text" className="right startDate" onChange={this.formChanged} defaultValue={this.state.startYear + '-' + this.state.startMonth + '-' + this.state.startDay} />
				<label htmlFor="endDate" className="left">End:</label>
				<input name="endDate" type="text" className="right endDate" onChange={this.formChanged} defaultValue={this.state.endYear + '-' + this.state.endMonth + '-' + this.state.endDay} />
				<button className="submit" onClick={this.submitForm}>Update</button>
			</form> : ''}
			<TransactionList transactions={this.state.transactions} />
			</>;
	}

	formChanged(event) {
		const input = event.target;
		this.setState((state) => {
			const newState = {};
			if (input.name === 'startDate') {
				const date = new Date(input.value);
				newState.startYear = (date.getUTCFullYear() + '').padStart(4, '0');
				newState.startMonth = ((date.getUTCMonth() + 1) + '').padStart(2, '0');
				newState.startDay = (date.getUTCDate() + '').padStart(2, '0');
			}
			else if (input.name === 'endDate') {
				const date = new Date(input.value);
				newState.endYear = (date.getUTCFullYear() + '').padStart(4, '0');
				newState.endMonth = ((date.getUTCMonth() + 1) + '').padStart(2, '0');
				newState.endDay = (date.getUTCDate() + '').padStart(2, '0');
			}
			return newState;
		});
	}

	toggleFilterForm() {
		this.setState((state) => {
			return {
				filterForm: !state.filterForm
			};
		});
	}

	goToImportTransactions() {
		this.props.router.push({
			page: 'importTransactions',
			name: this.props.router.getValueOf('name')
		});
	}

	async submitForm(event) {
		// Send the command to the server.
		try {
			this.props.router.push({
				page: 'viewAccount',
				name: this.props.router.getValueOf('name'),
				start: this.state.startYear + '-' + this.state.startMonth + '-' + this.state.startDay,
				end: this.state.endYear + '-' + this.state.endMonth + '-' + this.state.endDay
			});
			await this.update();
		}
		catch (errorMessage) {
			this.setState({
				feedback: errorMessage
			});
		}
	}

	/**
	 * Updates the list of transactions.
	 * @private
	 */
	async update() {
		/** @type {Transaction[]} */
		this.setState({
			transactions: (await this.props.server.send({
				command: 'list transactions',
				name: this.props.router.getValueOf('name'),
				startDate: this.state.startYear + '-' + this.state.startMonth + '-' + this.state.startDay,
				endDate: this.state.endYear + '-' + this.state.endMonth + '-' + this.state.endDay
			})).reverse()
		});
	}
}
