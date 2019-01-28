import Component from '../component';

class TransactionToolbar extends Component {
	/**
	 * Constructor.
	 * @param {string} gridArea
	 */
	constructor(gridArea) {
		super(gridArea);

		this.__style = `
			#account-toolbar form {
				display: grid;
				grid-template-columns: 6em auto;
			}

			#account-toolbar label {
				display: block;
				color: black;
				width: 6em;
			}
			#account-toolbar input[type=text], select {
				display: block;
				color: black;
			}
			#account-toolbar input[type=submit] {
				grid-column-start: 1;
				grid-column-end: 3;
				display: block;
				color: black;
				width: 100%;
			}
			`;

		this.__div.id = 'account-toolbar';
		this.__div.innerHTML = `
			<form id="showTransactions" action="javascript:void(null);">
				<label for="start_year">Start Year:</label>
				<input type="text" id="start_year" />
				<label for="start_month">Start Month:</label>
				<select id="start_month">
					<option value="1">January</option>
					<option value="2">February</option>
					<option value="3">March</option>
					<option value="4">April</option>
					<option value="5">May</option>
					<option value="6">June</option>
					<option value="7">July</option>
					<option value="8">August</option>
					<option value="9">September</option>
					<option value="10">October</option>
					<option value="11">November</option>
					<option value="12">December</option>
				</select>
				<label for="end_year">End Year:</label>
				<input type="text" id="end_year" />
				<label for="end_month">End Month:</label>
				<select id="end_month">
					<option value="1">January</option>
					<option value="2">February</option>
					<option value="3">March</option>
					<option value="4">April</option>
					<option value="5">May</option>
					<option value="6">June</option>
					<option value="7">July</option>
					<option value="8">August</option>
					<option value="9">September</option>
					<option value="10">October</option>
					<option value="11">November</option>
					<option value="12">December</option>
				</select>
				<input type="submit" id="submit" value="List Transactions" />
			</form>
			<div class="button">Import Transaction File</div>`;

		let end = new Date();
		let start = new Date(end);
		start.setMonth(start.getMonth() - 3);
		this.__div.querySelector('#showTransactions #start_year').value = start.getFullYear();
		this.__div.querySelector('#showTransactions #start_month').value = start.getMonth() + 1;
		this.__div.querySelector('#showTransactions #end_year').value = end.getFullYear();
		this.__div.querySelector('#showTransactions #end_month').value = end.getMonth() + 1;

		this.__div.querySelector('#showTransactions #submit').addEventListener('click', () => {
			let startYear = this.__div.querySelector('#showTransactions #start_year').value;
			let startMonth = this.__div.querySelector('#showTransactions #start_month').value;
			let startDate = startYear + '-' + startMonth + '-01';
			let endYear = this.__div.querySelector('#showTransactions #end_year').value;
			let endMonth = this.__div.querySelector('#showTransactions #end_month').value;
			let daysInEndMonth = new Date(endYear, endMonth, 0).getDate();
			let endDate = endYear.padStart(4, '0') + '-' + endMonth.padStart(2, '0') + '-' + daysInEndMonth.toString().padStart(2, '0');
			document.body.querySelector('transaction-list').setDateRange(startDate, endDate);
		});
	}
}

export default TransactionToolbar;
