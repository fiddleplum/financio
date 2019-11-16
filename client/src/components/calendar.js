import { Component } from '../../../../app-js/src/index';
import style from './calendar.css';
import Interval from './interval';

/**
 * A calendar component that can select a single day.
 */
export default class Calendar extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 * @param {Date|Date[]|Interval<Date>|Interval<Date>[]} date
	 */
	constructor(elem, date) {
		super(elem);

		/**
		 * The currently shown year.
		 * @type {number}
		 * @private
		 */
		this._shownYear = undefined;

		/**
		 * The currently shown month.
		 * @type {number}
		 * @private
		 */
		this._shownMonth = undefined;

		/**
		 * The currently selected date ranges.
		 * @type {Interval<Date>[]}
		 * @private
		 */
		this._selectedDateRanges = [];

		/**
		 * The bounds on the date selection.
		 * @type {Interval<Date>}
		 * @private
		 */
		this._dateBounds = new Interval(new Date(1900, 0, 1), new Date(2100, 0, 1));

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

		// Set the selected dates.
		if (date instanceof Date) {
			this._selectedDateRanges.push(new Interval(date, date));
		}
		else if (date instanceof Interval) {
			this._selectedDateRanges.push(new Interval(date.min, date.max));
		}
		else if (date instanceof Array) {
			for (let i = 0; i < date.length; i++) {
				const dateItem = date[i];
				if (dateItem instanceof Date) {
					this._selectedDateRanges.push(new Interval(dateItem, dateItem));
				}
				else if (dateItem instanceof Interval) {
					this._selectedDateRanges.push(new Interval(dateItem.min, dateItem.max));
				}
			}
		}

		if (this._selectedDateRanges.length > 0) {
			this._updateShown(this._selectedDateRanges[0].min.getFullYear(), this._selectedDateRanges[0].max.getMonth() + 1);
		}
	}

	/**
	 * Updates the shown year and month.
	 * @param {number} year
	 * @param {number} month
	 */
	_updateShown(year, month) {
		let daysNeedUpdate = false;
		if (this._shownYear !== year) {
			this._shownYear = year;
			this.setHtml('year_current', this._shownYear.toString());
			daysNeedUpdate = true;
		}
		if (this._shownMonth !== month) {
			this._shownMonth = month;
			this.setHtml('month_current', Calendar._monthNames[month - 1]);
			daysNeedUpdate = true;
		}
		if (daysNeedUpdate) {
			const date = new Date(this._shownYear, this._shownMonth - 1, 1);
			date.setDate(1 - date.getDay());
			for (let i = 0; i < 42; i++, date.setDate(date.getDate() + 1)) {
				const dayElem = this.get('day_' + i.toString());
				if (date.getMonth() + 1 === this._shownMonth) {
					dayElem.classList.remove('anotherMonth');
				}
				else {
					dayElem.classList.add('anotherMonth');
				}
				if (this._dateBounds.min <= date && date <= this._dateBounds.max) {
					dayElem.innerHTML = date.getDate().toString();
					dayElem.classList.add('clickable');
				}
				else {
					dayElem.innerHTML = '';
					dayElem.classList.remove('clickable');
				}
			}
		}
	}

	_offsetDate(years, months) {
		let newDate = new Date(this._shownYear, this._shownMonth - 1);
		newDate.setFullYear(newDate.getFullYear() + years);
		newDate.setMonth(newDate.getMonth() + months);
		if (newDate < this._dateBounds.min) {
			newDate = this._dateBounds.min;
		}
		else if (newDate > this._dateBounds.max) {
			newDate = this._dateBounds.max;
		}
		this._updateShown(newDate.getFullYear(), newDate.getMonth() + 1);
	}

	_getDaysInMonth(date) {
		const month = date.getMonth() + 1;
		if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
			return 31;
		}
		else if (month === 2) {
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
	<div id="decade_dec" class="clickable">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="20,4 4,16 20,27" />
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="28,4 12,16 28,27" />
		</svg>
	</div>
	<div id="year_dec" class="clickable">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="24,4 8,16 24,27" />
		</svg>
	</div>
	<div id="year_current"></div>
	<div id="year_inc" class="clickable">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="8,4 24,16 8,27" />
		</svg>
	</div>
	<div id="decade_inc" class="clickable">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="12,4 28,16 12,27" />
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="4,4 20,16 4,27" />
		</svg>
	</div>
	<div id="month_dec" class="clickable">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="24,4 8,16 24,27" />
		</svg>
	</div>
	<div id="month_current"></div>
	<div id="month_inc" class="clickable">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="8,4 24,16 8,27" />
		</svg>
	</div>
	<div class="week">S</div>
	<div class="week">M</div>
	<div class="week">T</div>
	<div class="week">W</div>
	<div class="week">T</div>
	<div class="week">F</div>
	<div class="week">S</div>
	<div id="day_0"></div>
	<div id="day_1"></div>
	<div id="day_2"></div>
	<div id="day_3"></div>
	<div id="day_4"></div>
	<div id="day_5"></div>
	<div id="day_6"></div>
	<div id="day_7"></div>
	<div id="day_8"></div>
	<div id="day_9"></div>
	<div id="day_10"></div>
	<div id="day_11"></div>
	<div id="day_12"></div>
	<div id="day_13"></div>
	<div id="day_14"></div>
	<div id="day_15"></div>
	<div id="day_16"></div>
	<div id="day_17"></div>
	<div id="day_18"></div>
	<div id="day_19"></div>
	<div id="day_20"></div>
	<div id="day_21"></div>
	<div id="day_22"></div>
	<div id="day_23"></div>
	<div id="day_24"></div>
	<div id="day_25"></div>
	<div id="day_26"></div>
	<div id="day_27"></div>
	<div id="day_28"></div>
	<div id="day_29"></div>
	<div id="day_30"></div>
	<div id="day_31"></div>
	<div id="day_32"></div>
	<div id="day_33"></div>
	<div id="day_34"></div>
	<div id="day_35"></div>
	<div id="day_36"></div>
	<div id="day_37"></div>
	<div id="day_38"></div>
	<div id="day_39"></div>
	<div id="day_40"></div>
	<div id="day_41"></div>
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
