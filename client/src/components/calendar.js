import { Component } from '../../../../app-js/src/index';
import style from './calendar.css';

/**
 * A calendar component that can select a single day.
 */
export default class Calendar extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 * @param {Date} date
	 */
	constructor(elem, date) {
		super(elem);

		/**
		 * The current date (only year and month used).
		 * @type {Date}
		 * @private
		 */
		this._currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

		this._minDate = new Date(

		// Setup the event handlers.
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

		// Set the current date to now.
		this.date = new Date();
	}

	/**
	 * Sets the calendar to a given date.
	 * @param {Date} date
	 */
	set date(date) {
		let daysNeedUpdate = false;
		if (this._currentDate.getFullYear() !== date.getFullYear()) {
			this._currentDate.setFullYear(date.getFullYear());
			this.setHtml('year_current', this._currentDate.getFullYear().toString());
			daysNeedUpdate = true;
		}
		if (this._currentDate.getMonth() !== date.getMonth()) {
			this._currentDate.setMonth(date.getMonth());
			this.setHtml('month_current', Calendar._monthNames[this._currentDate.getMonth()]);
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
			this.date = this._startDate;
		}
		else if (newDate > this._endDate) {
			this.date = this._endDate;
		}
		else {
			this.date = newDate;
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

Calendar.html = `
	<div id="decade_dec" class="clickable vertical-align">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="20,4 4,16 20,27" />
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="28,4 12,16 28,27" />
		</svg>
	</div>
	<div id="year_dec" class="clickable vertical-align">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="24,4 8,16 24,27" />
		</svg>
	</div>
	<div id="year_current" class="vertical-align"></div>
	<div id="year_inc" class="clickable vertical-align">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="8,4 24,16 8,27" />
		</svg>
	</div>
	<div id="decade_inc" class="clickable vertical-align">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="12,4 28,16 12,27" />
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="4,4 20,16 4,27" />
		</svg>
	</div>
	<div id="month_dec" class="clickable vertical-align">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="24,4 8,16 24,27" />
		</svg>
	</div>
	<div id="month_current" class="vertical-align"></div>
	<div id="month_inc" class="clickable vertical-align">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="8,4 24,16 8,27" />
		</svg>
	</div>
	<div class="vertical-align week">S</div>
	<div class="vertical-align week">M</div>
	<div class="vertical-align week">T</div>
	<div class="vertical-align week">W</div>
	<div class="vertical-align week">T</div>
	<div class="vertical-align week">F</div>
	<div class="vertical-align week">S</div>
	<div id="day_0" class="clickable vertical-align"></div>
	<div id="day_1" class="clickable vertical-align"></div>
	<div id="day_2" class="clickable vertical-align"></div>
	<div id="day_3" class="clickable vertical-align"></div>
	<div id="day_4" class="clickable vertical-align"></div>
	<div id="day_5" class="clickable vertical-align"></div>
	<div id="day_6" class="clickable vertical-align"></div>
	<div id="day_7" class="clickable vertical-align"></div>
	<div id="day_8" class="clickable vertical-align"></div>
	<div id="day_9" class="clickable vertical-align"></div>
	<div id="day_10" class="clickable vertical-align"></div>
	<div id="day_11" class="clickable vertical-align"></div>
	<div id="day_12" class="clickable vertical-align"></div>
	<div id="day_13" class="clickable vertical-align"></div>
	<div id="day_14" class="clickable vertical-align"></div>
	<div id="day_15" class="clickable vertical-align"></div>
	<div id="day_16" class="clickable vertical-align"></div>
	<div id="day_17" class="clickable vertical-align"></div>
	<div id="day_18" class="clickable vertical-align"></div>
	<div id="day_19" class="clickable vertical-align"></div>
	<div id="day_20" class="clickable vertical-align"></div>
	<div id="day_21" class="clickable vertical-align"></div>
	<div id="day_22" class="clickable vertical-align"></div>
	<div id="day_23" class="clickable vertical-align"></div>
	<div id="day_24" class="clickable vertical-align"></div>
	<div id="day_25" class="clickable vertical-align"></div>
	<div id="day_26" class="clickable vertical-align"></div>
	<div id="day_27" class="clickable vertical-align"></div>
	<div id="day_28" class="clickable vertical-align"></div>
	<div id="day_29" class="clickable vertical-align"></div>
	<div id="day_30" class="clickable vertical-align"></div>
	<div id="day_31" class="clickable vertical-align"></div>
	<div id="day_32" class="clickable vertical-align"></div>
	<div id="day_33" class="clickable vertical-align"></div>
	<div id="day_34" class="clickable vertical-align"></div>
	<div id="day_35" class="clickable vertical-align"></div>
	<div id="day_36" class="clickable vertical-align"></div>
	<div id="day_37" class="clickable vertical-align"></div>
	<div id="day_38" class="clickable vertical-align"></div>
	<div id="day_39" class="clickable vertical-align"></div>
	<div id="day_40" class="clickable vertical-align"></div>
	<div id="day_41" class="clickable vertical-align"></div>
	`;

Calendar.style = style;

Calendar._monthNames = [
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
