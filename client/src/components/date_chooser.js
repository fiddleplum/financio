import { Component, ShowHide } from '../../../../app-js/src/index';
import style from './date_chooser.css';
import YMD from './ymd';
import calendarSVG from './date_chooser_calendar.svg';
import './calendar';

/**
 * A generic date chooser.
 */
export default class DateChooser extends Component {
	/**
	 * Constructs the app.
	 * @param {HTMLElement} elem - The element inside which the component will reside.
	 * @param {YMD} date - The date to initially present.
	 */
	constructor(elem, date) {
		super(elem);

		/**
		 * The displayed date.
		 * @type {YMD}
		 * @private
		 */
		this._date = new YMD();

		this._onClickInsideCalendar = this._onClickInsideCalendar.bind(this);
		this._onClickOutsideCalendar = this._onClickOutsideCalendar.bind(this);

		// Set the date.
		this.date = date;

		// Setup the click callback for the calendar.
		const calendar = this.getComponent('calendar');
		calendar.clickCallback = (date) => {
			this.date = date;
			calendar.select(this._date);
			ShowHide.hide(calendar.elem);
		};
	}

	destroy() {
		window.removeEventListener('click', this._onClickOutsideCalendar);
	}

	/**
	 * Gets the date.
	 */
	get date() {
		return this._date;
	}

	/**
	 * Sets the date.
	 * @param {YMD} date
	 */
	set date(date) {
		this._date.copy(date);
		this.get('year').value = this._date.year;
		this.get('month').value = this._date.month;
		this.get('day').value = this._date.day;
	}

	_onDateChange() {
		try {
			const year = parseInt(this.get('year').value);
			const month = parseInt(this.get('month').value);
			const day = parseInt(this.get('day').value);
			const date = new YMD(year, month, day);
			this._date.copy(date);
		}
		catch (e) {
			this._date.year = Number.NaN;
			this._date.month = Number.NaN;
			this._date.day = Number.NaN;
		}
	}

	/**
	 * @param {MouseEvent} event
	 */
	_toggleCalendar(event) {
		const calendar = this.getComponent('calendar');
		calendar.clearSelections();
		if (ShowHide.isHidden(calendar.elem)) {
			calendar.select(this._date);
			ShowHide.show(calendar.elem);
			calendar.elem.addEventListener('click', this._onClickInsideCalendar);
			window.addEventListener('click', this._onClickOutsideCalendar);
		}
		else {
			calendar.elem.removeEventListener('click', this._onClickInsideCalendar);
			window.removeEventListener('click', this._onClickOutsideCalendar);
			ShowHide.hide(calendar.elem);
		}
		event.stopPropagation();
	}

	/**
	 * @param {MouseEvent} event
	 */
	_onClickInsideCalendar(event) {
		event.stopPropagation();
	}

	/**
	 * @param {MouseEvent} event
	 */
	_onClickOutsideCalendar(event) {
		ShowHide.hide(this.getComponent('calendar').elem);
	}
}

DateChooser.html = `
	<div><span id="date"><input id="year" type="text" value="" placeholder="YYYY" maxlength=4 onchange="_onDateChange">-<input id="month" type="text" value="" placeholder="MM" maxlength=2 onchange="_onDateChange">-<input id="day" type="text" value="" placeholder="DD" maxlength=2 onchange="_onDateChange"></span> <button onclick="_toggleCalendar">${calendarSVG}</button></div>
	<Calendar id="calendar" style="display: none;" />
	`;
DateChooser.style = style;

Component.register(DateChooser);
