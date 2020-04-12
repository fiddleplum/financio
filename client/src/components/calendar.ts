import { Component } from '../../../../app-ts/src/index';
import html from './calendar.html';
import css from './calendar.css';
import { Interval, YMD } from '../internal';

/** A calendar component that can select a single day. */
export class Calendar extends Component {
	/** The currently shown year. */
	private _shownYear: number = Number.NaN;

	/** The currently shown month. */
	private _shownMonth: number = Number.NaN;

	/** The list of date objects for each date shown. */
	private _dates: YMD[] = [];

	/** The currently selected date ranges. */
	private _selectedDateRanges: Interval<YMD>[] = [];

	/** The bounds on the date selection. */
	private _dateBounds = new Interval(new YMD(1, 1, 1), new YMD(9999, 12, 31));

	/** A callback that is called when the user clicks a date. */
	public clickCallback: ((date: YMD) => void) | null = null;

	private static _monthNames = [
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

	constructor(params: Component.Params) {
		super(params);

		const onClickAttribute = params.attributes.get('onclick');
		if (onClickAttribute instanceof Function) {
			this.clickCallback = onClickAttribute as (date: YMD) => void;
		}

		// Setup the date objects.
		for (let i = 0; i < 42; i++) {
			this._dates.push(new YMD());
		}

		// Set the shown date to now.
		const now = new Date();
		this._updateShown(now.getFullYear(), now.getMonth() + 1, false);
	}

	/*** Selects dates. */
	select(date: YMD | Interval<YMD> | (YMD | Interval<YMD>)[]): void {
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

	/** Deselects dates. */
	deselect(date: YMD | Interval<YMD> | (YMD | Interval<YMD>)[]): void {
		// Get the deselected dates.
		const deselectedDates = this._getIntervalsFromParam(date);
		// Set the selected dates.
		for (let i = 0; i < this._selectedDateRanges.length; i++) {
			const dateInterval = this._selectedDateRanges[i];
			for (let j = 0; j < deselectedDates.length; j++) {
				const deselectInterval = deselectedDates[j];
				if (deselectInterval.min <= dateInterval.max && dateInterval.min <= deselectInterval.max) {
					if (dateInterval.max <= deselectInterval.max) { // Move down the max.
						dateInterval.max.copy(deselectInterval.min);
						dateInterval.max.day -= 1;
					}
					if (dateInterval.min >= deselectInterval.min) { // Move up the min.
						dateInterval.min.copy(deselectInterval.max);
						dateInterval.min.day += 1;
					}
					if (dateInterval.min < deselectInterval.min && deselectInterval.max < dateInterval.max) { // Split the dateInterval in two.
						const splitPoint = new YMD(deselectInterval.min);
						splitPoint.day -= 1;
						this._selectedDateRanges.push(new Interval(dateInterval.min, splitPoint));
						dateInterval.min.copy(deselectInterval.max);
						dateInterval.min.day += 1;
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

	/** Clears all of the selections. */
	clearSelections(): void {
		this._selectedDateRanges = [];
		// Update the calendar.
		this._updateShown(this._shownYear, this._shownMonth, true);
	}

	/** Gets an array of intervals from the date param. */
	_getIntervalsFromParam(date: YMD | Interval<YMD> | (YMD | Interval<YMD>)[]): Interval<YMD>[] {
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

	/** Updates the shown year and month. */
	private _updateShown(year: number, month: number, forceUpdate: boolean): void {
		let daysNeedUpdate = false;
		if (this._shownYear !== year) {
			this._shownYear = year;
			this.__setHtml(this.__element('year_current'), this._shownYear.toString());
			daysNeedUpdate = true;
		}
		if (this._shownMonth !== month) {
			this._shownMonth = month;
			this.__setHtml(this.__element('month_current'), Calendar._monthNames[month - 1]);
			daysNeedUpdate = true;
		}
		if (daysNeedUpdate || forceUpdate) {
			const date = new YMD(this._shownYear, this._shownMonth, 1);
			date.day = -date.dayOfWeek;
			for (let i = 0; i < 42; i++, date.day += 1) {
				const dayElem = this.__element('day_' + i.toString());
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

	/** Offsets the currently show month by the number. */
	private _offsetDate(years: number, months: number): void {
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

	/** Occurs when the user clicks a date. */
	private _onClick(event: MouseEvent): void {
		if (this.clickCallback !== null) {
			const elem = event.target;
			if (elem instanceof HTMLDivElement) {
				const index = parseInt((elem.getAttribute('ref') as string).substr(4));
				const date = this._dates[index];
				console.log(index, date);
				if (this._dateBounds.min <= date && date <= this._dateBounds.max) {
					this.clickCallback(date);
				}
			}
		}
	}

	/** Decrements the date by 10 years. */
	_decadeDec(): void {
		this._offsetDate(-10, 0);
	}

	/** Increments the date by 10 years. */
	_decadeInc(): void {
		this._offsetDate(+10, 0);
	}

	/** Decrements the date by 1 year. */
	_yearDec(): void {
		this._offsetDate(-1, 0);
	}

	/** Increments the date by 1 year. */
	_yearInc(): void {
		this._offsetDate(+1, 0);
	}

	/** Decrements the date by 1 month. */
	_monthDec(): void {
		this._offsetDate(0, -1);
	}

	/** Increments the date by 1 month. */
	_monthInc(): void {
		this._offsetDate(0, +1);
	}
}

Calendar.html = html;
Calendar.css = css;

Calendar.register();
