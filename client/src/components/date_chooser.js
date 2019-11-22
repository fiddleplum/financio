import { Component, ShowHide } from '../../../../app-js/src/index';
import Calendar from './calendar';
import style from './date_chooser.css';
import YMD from './ymd';
import calendarSVG from './date_chooser_calendar.svg';

/**
 * A generic date chooser.
 */
export default class DateChooser extends Component {
	/**
	 * Constructs the app.
	 * @param {HTMLElement} elem - The element inside which the component will reside.
	 * @param {YMD} date - The date to initially present.
	 * @param {string} name - The name of the form input.
	 */
	constructor(elem, date, name) {
		super(elem);

		/**
		 * The displayed date.
		 * @type {YMD}
		 * @private
		 */
		this._date = new YMD();

		this.get('date').name = name;

		// Set the date.
		this.date = date;

		// Set the calendar.
		this.__setComponent('calendar', Calendar, this._date, (date) => {
			console.log(date);
			this.date = date;
		});
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
		this.get('date').value = this._date.toString();
	}

	_onDateChange() {
		const input = this.get('date').value;
		try {
			const date = new YMD(input);
			this._date.copy(date);
		}
		catch (e) {
		}
	}

	_toggleCalendar() {
		const calendar = this.__getComponent('calendar');
		if (calendar instanceof Calendar) {
			calendar.clearSelections();
			calendar.select(this._date);
			ShowHide.toggle(calendar.elem);
		}
	}
}

DateChooser.html = `
	<div><input id="date" type="text" value="" placeholder="YYYY-MM-DD" onchange="_onDateChange"><button onclick="_toggleCalendar">${calendarSVG}</button></div>
	<div id="calendar" style="display: none;"></div>
	`;

DateChooser.style = style;
