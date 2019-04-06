import { Component } from '../../../../app-js/src/index'

class TransactionToolbar extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 * @param {string} accountName
	 */
	constructor(elem, accountName, startDate, endDate, searchTerm) {
		super(elem);

		this.__style = `
			.TransactionToolbar {
				padding: 1em;
			}

			.TransactionToolbar form {
				display: grid;
				grid-template-columns: 6em auto;
			}

			.TransactionToolbar label {
				display: block;
				width: 6em;
			}
			.TransactionToolbar input[type=text], select {
				display: block;
			}
			.TransactionToolbar input[type=submit] {
				grid-column-start: 1;
				grid-column-end: 3;
				display: block;
				width: 100%;
			}
			`;

		this.__html = `
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
			<div class="button">Import Transaction File</div>
			`;

		this.__query('#showTransactions #start_year').value = startDate.getFullYear();
		this.__query('#showTransactions #start_month').value = ('' + (startDate.getMonth() + 1)).padStart(2, '0');
		this.__query('#showTransactions #end_year').value = endDate.getFullYear();
		this.__query('#showTransactions #end_month').value = ('' + (endDate.getMonth() + 1)).padStart(2, '0');

		this.__query('#showTransactions #submit').addEventListener('click', () => {
			let startYear = this.__query('#showTransactions #start_year').value;
			let startMonth = this.__query('#showTransactions #start_month').value;
			let startDate = startYear + '-' + startMonth + '-01';
			let endYear = this.__query('#showTransactions #end_year').value;
			let endMonth = this.__query('#showTransactions #end_month').value;
			let daysInEndMonth = new Date(endYear, endMonth, 0).getDate();
			let endDate = endYear.padStart(4, '0') + '-' + endMonth.padStart(2, '0') + '-' + daysInEndMonth.toString().padStart(2, '0');
			window.app.router.pushRoute('account/' + accountName + '/from/' + startYear + '-' + startMonth + '/to/' + endYear + '-' + endMonth);
		});
	}
}

export default TransactionToolbar;
