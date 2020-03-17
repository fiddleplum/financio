import { Component } from '../../../../app-js/src/index';
import Interval from './interval';
import YMD from './ymd';

/**
 * A calendar component that can select a single day.
 */
export default class Calendar extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 */
	constructor(elem) {
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
		 * The list of date objects for each date shown.
		 * @type {YMD[]}
		 * @private
		 */
		this._dates = [];

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
		this._dateBounds = new Interval(new YMD(1, 1, 1), new YMD(9999, 12, 31));

		/**
		 * A callback that is called when the user clicks a date.
		 * @type {(date:YMD) => void}
		 * @private
		 */
		this._clickCallback = null;

		// Setup the date objects.
		for (let i = 0; i < 42; i++) {
			this._dates.push(new YMD());
		}

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
	}

	/**
	 * Sets the click callback.
	 * @param {(date:YMD) => void} clickCallback
	 */
	set clickCallback(clickCallback) {
		this._clickCallback = clickCallback;
	}

	/**
	 * Selects dates.
	 * @param {YMD|Interval<YMD>|(YMD|Interval<YMD>)[]} date
	 */
	select(date) {
		// Add the selected dates.
		const selectedDates = this._getIntervalsFromParam(date);
		this._selectedDateRanges.splice(this._selectedDateRanges.length - 1, 0, ...selectedDates);
		// Union up any ranges.
		for (let i = 0; i < this._selectedDateRanges.length; i++) {
			for (let j = i + 1; j < this._selectedDateRanges.length; j++) {
				if (this._selectedDateRanges[j].min <= this._selectedDateRanges[i].max && this._selectedDateRanges[i].min <= this._selectedDateRanges[j].max) {
					if (this._selectedDateRanges[i].max < this._selectedDateRanges[j].max) {
						this._selectedDateRanges[i].max.copy(this._selectedDateRanges[j].max);
					}
					if (this._selectedDateRanges[i].min > this._selectedDateRanges[j].min) {
						this._selectedDateRanges[i].min.copy(this._selectedDateRanges[j].min);
					}
					this._selectedDateRanges.splice(j, 1);
					j -= 1;
				}
			}
		}
		// Update the calendar.
		this._updateShown(selectedDates[selectedDates.length - 1].max.year, selectedDates[selectedDates.length - 1].max.month, true);
	}

	/**
	 * Deselects dates.
	 * @param {YMD|Interval<YMD>|(YMD|Interval<YMD>)[]} date
	 */
	deselect(date) {
		// Get the deselected dates.
		const deselectedDates = this._getIntervalsFromParam(date);
		// Set the selected dates.
		for (let i = 0; i < this._selectedDateRanges.length; i++) {
			const dateInterval = this._selectedDateRanges[i];
			for (let j = 0; j < deselectedDates.length; j++) {
				const deselectInterval = deselectedDates[j];
				if (deselectInterval.min <= dateInterval.max && dateInterval.min <= deselectInterval.max) {
					if (dateInterval.max <= deselectInterval.max) { // Move down the max.
						dateInterval.max.copy(deselectInterval.min - 1);
					}
					if (dateInterval.min >= deselectInterval.min) { // Move up the min.
						dateInterval.min.copy(deselectInterval.max + 1);
					}
					if (dateInterval.min < deselectInterval.min && deselectInterval.max < dateInterval.max) { // Split the dateInterval in two.
						this._selectedDateRanges.push(new Interval(dateInterval.min, new Date(deselectInterval.min - 1)));
						dateInterval.min.copy(deselectInterval.max + 1);
					}
					if (dateInterval.min > dateInterval.max) { // Remove the now invalid interval.
						this._selectedDateRanges.splice(i, 1);
						i -= 1;
					}
				}
			}
		}
		// Update the calendar.
		this._updateShown(deselectedDates[deselectedDates.length - 1].max.year, deselectedDates[deselectedDates.length - 1].max.month, true);
	}

	/**
	 * Clears all of the selections.
	 */
	clearSelections() {
		this._selectedDateRanges = [];
		// Update the calendar.
		this._updateShown(this._shownYear, this._shownMonth, true);
	}

	/**
	 * Gets an array of intervals from the date param.
	 * @param {YMD|Interval<YMD>|(YMD|Interval<YMD>)[]} date
	 * @returns {Interval<YMD>[]}
	 */
	_getIntervalsFromParam(date) {
		/** @type {Interval<YMD>[]} */
		const intervals = [];
		if (date instanceof YMD) {
			intervals.push(new Interval(date, date));
		}
		else if (date instanceof Interval) {
			intervals.push(new Interval(date.min, date.max));
		}
		else if (date instanceof Array) {
			for (let i = 0; i < date.length; i++) {
				const dateItem = date[i];
				if (dateItem instanceof YMD) {
					intervals.push(new Interval(dateItem, dateItem));
				}
				else if (dateItem instanceof Interval) {
					intervals.push(new Interval(dateItem.min, dateItem.max));
				}
			}
		}
		return intervals;
	}

	/**
	 * Updates the shown year and month.
	 * @param {number} year
	 * @param {number} month
	 * @param {boolean} forceUpdate
	 */
	_updateShown(year, month, forceUpdate) {
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
		if (daysNeedUpdate || forceUpdate) {
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
					console.log('removing ');
					dayElem.classList.remove('clickable', 'selected');
				}
				this._dates[i].copy(date);
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
		this._updateShown(newDate.year, newDate.month, false);
	}

	/**
	 * Occurs when the user clicks a date.
	 * @param {MouseEvent} event
	 */
	_onClick(event) {
		if (this._clickCallback !== null) {
			const elem = event.target;
			if (elem instanceof HTMLDivElement) {
				const index = parseInt(elem.id.substr(4));
				const date = this._dates[index];
				if (this._dateBounds.min <= date && date <= this._dateBounds.max) {
					if (this._clickCallback !== null) {
						this._clickCallback(date);
					}
				}
			}
		}
	}
}

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

Calendar.html = `
	<div id="decade_dec" class="clickable no-select">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="20,4 4,16 20,27" />
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="28,4 12,16 28,27" />
		</svg>
	</div>
	<div id="year_dec" class="clickable no-select">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="24,4 8,16 24,27" />
		</svg>
	</div>
	<div id="year_current" class="no-select"></div>
	<div id="year_inc" class="clickable">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="8,4 24,16 8,27" />
		</svg>
	</div>
	<div id="decade_inc" class="clickable no-select">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="12,4 28,16 12,27" />
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="4,4 20,16 4,27" />
		</svg>
	</div>
	<div id="month_dec" class="clickable no-select">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="24,4 8,16 24,27" />
		</svg>
	</div>
	<div id="month_current" class="no-select"></div>
	<div id="month_inc" class="clickable no-select">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="8,4 24,16 8,27" />
		</svg>
	</div>
	<div class="week no-select">S</div>
	<div class="week no-select">M</div>
	<div class="week no-select">T</div>
	<div class="week no-select">W</div>
	<div class="week no-select">T</div>
	<div class="week no-select">F</div>
	<div class="week no-select">S</div>
	<div id="day_0" class="no-select" onclick="_onClick"></div>
	<div id="day_1" class="no-select" onclick="_onClick"></div>
	<div id="day_2" class="no-select" onclick="_onClick"></div>
	<div id="day_3" class="no-select" onclick="_onClick"></div>
	<div id="day_4" class="no-select" onclick="_onClick"></div>
	<div id="day_5" class="no-select" onclick="_onClick"></div>
	<div id="day_6" class="no-select" onclick="_onClick"></div>
	<div id="day_7" class="no-select" onclick="_onClick"></div>
	<div id="day_8" class="no-select" onclick="_onClick"></div>
	<div id="day_9" class="no-select" onclick="_onClick"></div>
	<div id="day_10" class="no-select" onclick="_onClick"></div>
	<div id="day_11" class="no-select" onclick="_onClick"></div>
	<div id="day_12" class="no-select" onclick="_onClick"></div>
	<div id="day_13" class="no-select" onclick="_onClick"></div>
	<div id="day_14" class="no-select" onclick="_onClick"></div>
	<div id="day_15" class="no-select" onclick="_onClick"></div>
	<div id="day_16" class="no-select" onclick="_onClick"></div>
	<div id="day_17" class="no-select" onclick="_onClick"></div>
	<div id="day_18" class="no-select" onclick="_onClick"></div>
	<div id="day_19" class="no-select" onclick="_onClick"></div>
	<div id="day_20" class="no-select" onclick="_onClick"></div>
	<div id="day_21" class="no-select" onclick="_onClick"></div>
	<div id="day_22" class="no-select" onclick="_onClick"></div>
	<div id="day_23" class="no-select" onclick="_onClick"></div>
	<div id="day_24" class="no-select" onclick="_onClick"></div>
	<div id="day_25" class="no-select" onclick="_onClick"></div>
	<div id="day_26" class="no-select" onclick="_onClick"></div>
	<div id="day_27" class="no-select" onclick="_onClick"></div>
	<div id="day_28" class="no-select" onclick="_onClick"></div>
	<div id="day_29" class="no-select" onclick="_onClick"></div>
	<div id="day_30" class="no-select" onclick="_onClick"></div>
	<div id="day_31" class="no-select" onclick="_onClick"></div>
	<div id="day_32" class="no-select" onclick="_onClick"></div>
	<div id="day_33" class="no-select" onclick="_onClick"></div>
	<div id="day_34" class="no-select" onclick="_onClick"></div>
	<div id="day_35" class="no-select" onclick="_onClick"></div>
	<div id="day_36" class="no-select" onclick="_onClick"></div>
	<div id="day_37" class="no-select" onclick="_onClick"></div>
	<div id="day_38" class="no-select" onclick="_onClick"></div>
	<div id="day_39" class="no-select" onclick="_onClick"></div>
	<div id="day_40" class="no-select" onclick="_onClick"></div>
	<div id="day_41" class="no-select" onclick="_onClick"></div>
	`;

Calendar.style = `
	.Calendar {
		width: 14rem;
		border: 1px solid var(--fg-light);
		border-radius: .5rem;
		display: grid;
		grid-template-rows: repeat(9, 2rem);
		grid-template-columns: repeat(7, 2rem);
		cursor: default;
	}
	.Calendar #year_current {
		grid-column-start: 3;
		grid-column-end: 6;
	}
	.Calendar #month_current {
		grid-column-start: 2;
		grid-column-end: 7;
	}
	.Calendar > div {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		line-height: 1.5rem;
	}
	.Calendar svg {
		height: 1.5rem;
	}
	.Calendar .clickable {
		cursor: pointer;
	}
	.Calendar .clickable:hover {
		font-weight: bold;
		font-size: 1.5rem;
		line-height: 2rem;
	}
	.Calendar .clickable:hover svg {
		height: 2rem;
	}
	.Calendar .clickable:hover svg polyline {
		stroke-width: 4;
	}
	.Calendar .week {
		border-bottom: 1px solid var(--fg-light);
	}
	.Calendar .anotherMonth {
		color: var(--fg-light-disabled);
	}
	.Calendar .selected {
		background: var(--bg-dark);
		color: var(--fg-dark);
	}
	.Calendar .selected.first {
		border-top-left-radius: 1rem;
		border-bottom-left-radius: 1rem;
	}
	.Calendar .selected.last {
		border-top-right-radius: 1rem;
		border-bottom-right-radius: 1rem;
	}
	`;

Calendar.register();
