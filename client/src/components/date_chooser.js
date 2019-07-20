import { Component } from '../../../../app-js/src/index';

export default class DateChooser extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 */
	constructor(elem) {
		super(elem);

		this._startDate = new Date(1950, 0, 1);

		this._endDate = new Date(2050, 0, 1);

		this._currentDate = new Date(Number.NaN, Number.NaN, 1);
		this.setToDate(new Date());

		this.on('decade_dec', 'click', () => {
			this._offsetDate(-10, 0, 0);
		});
		this.on('decade_inc', 'click', () => {
			this._offsetDate(+10, 0, 0);
		});
		this.on('year_dec', 'click', () => {
			this._offsetDate(-1, 0, 0);
		});
		this.on('year_inc', 'click', () => {
			this._offsetDate(+1, 0, 0);
		});
		this.on('month_dec', 'click', () => {
			this._offsetDate(0, -1, 0);
		});
		this.on('month_inc', 'click', () => {
			this._offsetDate(0, +1, 0);
		});
	}

	setToDate(date) {
		let daysNeedUpdate = false;
		if (this._currentDate.getFullYear() !== date.getFullYear()) {
			this._currentDate.setFullYear(date.getFullYear());
			this.setRenderVar('year', this._currentDate.getFullYear().toString());
			daysNeedUpdate = true;
		}
		if (this._currentDate.getMonth() !== date.getMonth()) {
			this._currentDate.setMonth(date.getMonth());
			this.setRenderVar('month', DateChooser._monthNames[this._currentDate.getMonth()]);
			daysNeedUpdate = true;
		}
		if (daysNeedUpdate) {
			const date = new Date(this._currentDate);
			date.setDate(1 - this._currentDate.getDay());
			for (let i = 0; i < 42; i++, date.setDate(date.getDate() + 1)) {
				const dayElem = this.elem.querySelector('#day_' + i.toString());
				if (date.getMonth() === this._currentDate.getMonth()) {
					dayElem.classList.remove('unday');
				}
				else {
					dayElem.classList.add('unday');
				}
				dayElem.innerHTML = date.getDate().toString();
			}
		}
	}

	_offsetDate(years, months) {
		const newDate = new Date(this._currentDate);
		newDate.setFullYear(newDate.getFullYear() + years);
		newDate.setMonth(newDate.getMonth() + months);
		if (newDate < this._startDate) {
			this.setToDate(this._startDate);
		}
		else if (newDate > this._endDate) {
			this.setToDate(this._endDate);
		}
		else {
			this.setToDate(newDate);
		}
	}

	_getDaysInMonth(date) {
		const month = date.getMonth();
		if ([0, 2, 4, 6, 7, 9, 11].includes(month)) {
			return 31;
		}
		else if (month === 1) {
			const year = date.getFullYear();
			if (year % 4 === 0 && year % 100 !== 0) {
				return 29;
			}
			else return 28;
		}
		else {
			return 30;
		}
	}
}

DateChooser.html = `
	<div class="row no-select"><div id="decade_dec">&lt;&lt;</div><div id="year_dec">&lt;</div><div id="year_current">{{year}}</div><div id="year_inc">&gt;</div><div id="decade_inc">&gt;&gt;</div></div>
	<div class="row no-select"><div id="month_dec">&lt;</div><div id="month_current">{{month}}</div><div id="month_inc">&gt;</div></div>
	<div class="row no-select"><div id="Sunday">S</div><div id="Monday">M</div><div id="Tuesday">T</div><div id="Wednesday">W</div><div id="Thursday">T</div><div id="Friday">F</div><div id="Saturday">S</div></div>
	<div class="row no-select day"><div id="day_0"></div><div id="day_1"></div><div id="day_2"></div><div id="day_3"></div><div id="day_4"></div><div id="day_5"></div><div id="day_6"></div></div>
	<div class="row no-select day"><div id="day_7"></div><div id="day_8"></div><div id="day_9"></div><div id="day_10"></div><div id="day_11"></div><div id="day_12"></div><div id="day_13"></div></div>
	<div class="row no-select day"><div id="day_14"></div><div id="day_15"></div><div id="day_16"></div><div id="day_17"></div><div id="day_18"></div><div id="day_19"></div><div id="day_20"></div></div>
	<div class="row no-select day"><div id="day_21"></div><div id="day_22"></div><div id="day_23"></div><div id="day_24"></div><div id="day_25"></div><div id="day_26"></div><div id="day_27"></div></div>
	<div class="row no-select day"><div id="day_28"></div><div id="day_29"></div><div id="day_30"></div><div id="day_31"></div><div id="day_32"></div><div id="day_33"></div><div id="day_34"></div></div>
	<div class="row no-select day"><div id="day_35"></div><div id="day_36"></div><div id="day_37"></div><div id="day_38"></div><div id="day_39"></div><div id="day_40"></div><div id="day_41"></div></div>
`;

DateChooser.style = `
	.DateChooser .row {
		width: 14em;
		cursor: default;
	}
	.DateChooser .row div {
		display: inline-block;
		height: 1.5em;
		border: 1px solid var(--fg-light);
		width: 2em;
		cursor: default;
	}
	.DateChooser #year_current {
		width: 6em;
	}
	.DateChooser #month_current {
		width: 10em;
	}
	.DateChooser #decade_dec,
	.DateChooser #year_dec,
	.DateChooser #year_inc,
	.DateChooser #decade_inc,
	.DateChooser #month_dec,
	.DateChooser #month_inc,
	.DateChooser .day div {
		cursor: pointer;
	}
	.DateChooser .unday {
		color: var(--fg-light-disabled);
	}
	`;

DateChooser._monthNames = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'];
