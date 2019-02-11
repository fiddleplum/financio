import { Component } from 'app-js';

class TransactionToolbar extends Component {
	/**
	 * Constructor.
	 * @param {string} gridArea
	 * @param {string} accountName
	 */
	constructor(gridArea, accountName, startDate, endDate, searchTerm) {
		super(gridArea);

		this.__style = `
			#transaction-toolbar {
				padding: 1em;
			}

			#transaction-toolbar form {
				display: grid;
				grid-template-columns: 6em auto;
			}

			#transaction-toolbar label {
				display: block;
				width: 6em;
			}
			#transaction-toolbar input[type=text], select {
				display: block;
			}
			#transaction-toolbar input[type=submit] {
				grid-column-start: 1;
				grid-column-end: 3;
				display: block;
				width: 100%;
			}
			`;

		this.__div.id = 'transaction-toolbar';
		this.__div.innerHTML = `
			<form id="showTransactions" action="javascript:void(null);">
				<label for="start_year">Start Year:</label>
				<input type="text" id="start_year" />
				<label for="start_month">Start Month:</label>
				<select id="start_month">
					<option value="01">January</option>
					<option value="02">February</option>
					<option value="03">March</option>
					<option value="04">April</option>
					<option value="05">May</option>
					<option value="06">June</option>
					<option value="07">July</option>
					<option value="08">August</option>
					<option value="09">September</option>
					<option value="10">October</option>
					<option value="11">November</option>
					<option value="12">December</option>
				</select>
				<label for="end_year">End Year:</label>
				<input type="text" id="end_year" />
				<label for="end_month">End Month:</label>
				<select id="end_month">
					<option value="01">January</option>
					<option value="02">February</option>
					<option value="03">March</option>
					<option value="04">April</option>
					<option value="05">May</option>
					<option value="06">June</option>
					<option value="07">July</option>
					<option value="08">August</option>
					<option value="09">September</option>
					<option value="10">October</option>
					<option value="11">November</option>
					<option value="12">December</option>
				</select>
				<input type="submit" id="submit" value="List Transactions" />
			</form>
			<div class="button">Import Transaction File</div>`;

		this.__div.querySelector('#showTransactions #start_year').value = startDate.getFullYear();
		this.__div.querySelector('#showTransactions #start_month').value = ('' + (startDate.getMonth() + 1)).padStart(2, '0');
		this.__div.querySelector('#showTransactions #end_year').value = endDate.getFullYear();
		this.__div.querySelector('#showTransactions #end_month').value = ('' + (endDate.getMonth() + 1)).padStart(2, '0');

		this.__div.querySelector('#showTransactions #submit').addEventListener('click', () => {
			let startYear = this.__div.querySelector('#showTransactions #start_year').value;
			let startMonth = this.__div.querySelector('#showTransactions #start_month').value;
			let startDate = startYear + '-' + startMonth + '-01';
			let endYear = this.__div.querySelector('#showTransactions #end_year').value;
			let endMonth = this.__div.querySelector('#showTransactions #end_month').value;
			let daysInEndMonth = new Date(endYear, endMonth, 0).getDate();
			let endDate = endYear.padStart(4, '0') + '-' + endMonth.padStart(2, '0') + '-' + daysInEndMonth.toString().padStart(2, '0');
			window.financio.router.pushRoute('account/' + accountName + '/from/' + startYear + '-' + startMonth + '/to/' + endYear + '-' + endMonth);
		});
	}
}

export default TransactionToolbar;
