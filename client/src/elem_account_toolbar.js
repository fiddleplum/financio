class ElemAccountToolbar extends HTMLElement {
	constructor() {
		super();

		this._ws = null;
	}

	connectedCallback() {
		this.innerHTML = `
			<style>
				elem-account-toolbar form {
					display: grid;
					grid-template-columns: 6em auto;
				}

				elem-account-toolbar label {
					display: block;
					color: black;
					width: 6em;
				}
				elem-account-toolbar input[type=text], select {
					display: block;
					color: black;
				}
				elem-account-toolbar input[type=submit] {
					grid-column-start: 1;
					grid-column-end: 3;
					display: block;
					color: black;
					width: 100%;
				}
			</style>
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
		this.querySelector('#showTransactions #start_year').value = start.getFullYear();
		this.querySelector('#showTransactions #start_month').value = start.getMonth() + 1;
		this.querySelector('#showTransactions #end_year').value = end.getFullYear();
		this.querySelector('#showTransactions #end_month').value = end.getMonth() + 1;

		this.querySelector('#showTransactions #submit').addEventListener('click', () => {
			let startYear = this.querySelector('#showTransactions #start_year').value;
			let startMonth = this.querySelector('#showTransactions #start_month').value;
			let startDate = startYear + '-' + startMonth + '-01';
			let endYear = this.querySelector('#showTransactions #end_year').value;
			let endMonth = this.querySelector('#showTransactions #end_month').value;
			let daysInEndMonth = new Date(endYear, endMonth, 0).getDate();
			let endDate = endYear.padStart(4, '0') + '-' + endMonth.padStart(2, '0') + '-' + daysInEndMonth.toString().padStart(2, '0');
			document.body.querySelector('elem-transaction-list').setDateRange(startDate, endDate);
		});
	}

	initialize(ws, accountName) {
		this._ws = ws;
		this._accountName = accountName;
	}

}

window.customElements.define('elem-account-toolbar', ElemAccountToolbar);

export default ElemAccountToolbar;
