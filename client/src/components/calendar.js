import { Component } from '../../../../app-js/src/index';
import style from './calendar.css';
import Interval from './interval';
import YMD from './ymd';

/**
 * A calendar component that can select a single day.
 */
export default class Calendar extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 * @param {YMD|Interval<YMD>|(YMD|Interval<YMD>)[]} date
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
		 * @type {Interval<YMD>[]}
		 * @private
		 */
		this._selectedDateRanges = [];

		/**
		 * The bounds on the date selection.
		 * @type {Interval<YMD>}
		 * @private
		 */
		this._dateBounds = new Interval(new YMD(1900, 0, 1), new YMD(2100, 0, 1));

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
		if (date instanceof YMD) {
			this._selectedDateRanges.push(new Interval(date, date));
		}
		else if (date instanceof Interval) {
			this._selectedDateRanges.push(new Interval(date.min, date.max));
		}
		else if (date instanceof Array) {
			for (let i = 0; i < date.length; i++) {
				const dateItem = date[i];
				if (dateItem instanceof YMD) {
					this._selectedDateRanges.push(new Interval(dateItem, dateItem));
				}
				else if (dateItem instanceof Interval) {
					this._selectedDateRanges.push(new Interval(dateItem.min, dateItem.max));
				}
			}
		}

		if (this._selectedDateRanges.length > 0) {
			this._updateShown(this._selectedDateRanges[0].min.year, this._selectedDateRanges[0].max.month);
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
			const date = new YMD(this._shownYear, this._shownMonth, 1);
			date.day = -date.dayOfWeek;
			for (let i = 0; i < 42; i++, date.day += 1) {
				const dayElem = this.get('day_' + i.toString());
				if (date.month === this._shownMonth) {
					dayElem.classList.remove('anotherMonth');
				}
				else {
					dayElem.classList.add('anotherMonth');
				}
				if (this._dateBounds.min <= date && date <= this._dateBounds.max) {
					dayElem.innerHTML = date.day.toString();
					dayElem.classList.add('clickable');
					// Check if the date is selected.
					let selected = false;
					let first = false;
					let last = false;
					for (let i = 0; i < this._selectedDateRanges.length; i++) {
						if (this._selectedDateRanges[i].min <= date && date <= this._selectedDateRanges[i].max) {
							selected = true;
							first = this._selectedDateRanges[i].min.equals(date);
							last = this._selectedDateRanges[i].max.equals(date);
						}
					}
					if (selected) {
						dayElem.classList.add('selected');
					}
					else {
						dayElem.classList.remove('selected');
					}
					if (first) {
						dayElem.classList.add('first');
					}
					else {
						dayElem.classList.remove('first');
					}
					if (last) {
						dayElem.classList.add('last');
					}
					else {
						dayElem.classList.remove('last');
					}
				}
				else {
					dayElem.innerHTML = '';
					dayElem.classList.remove(['clickable', 'selected']);
				}
			}
		}
	}

	_offsetDate(years, months) {
		const newDate = new YMD(this._shownYear, this._shownMonth, 1);
		newDate.year += years;
		newDate.month += months;
		if (newDate < this._dateBounds.min) {
			newDate.copy(this._dateBounds.min);
		}
		else if (newDate > this._dateBounds.max) {
			newDate.copy(this._dateBounds.max);
		}
		this._updateShown(newDate.year, newDate.month);
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
