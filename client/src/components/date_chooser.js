import { Component, ShowHide } from '../../../../app-js/src/index';
import Calendar from './calendar';
import style from './date_chooser.css';
import YMD from './ymd';
import Interval from './interval';

/**
 * A generic date chooser.
 */
export default class DateChooser extends Component {
	/**
	 * Constructs the app.
	 * @param {HTMLElement} elem - The element inside which thee the component will reside.
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

		// Set the date.
		this.date = date;

		// Set the calendar.
		this.__setComponent('calendar', Calendar, [new Interval(this._date, this._date), new Interval(new YMD(this._date.year, this._date.month - 1, 15), new YMD(this._date.year, this._date.month, 1))]);
	}

	/**
	 * Sets the date.
	 * @param {YMD} date
	 */
	set date(date) {
		this._date.copy(date);
		this.setHtmlVariable('date', this._date.toString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			weekday: 'long'
		}));
		// this.setHtmlVariable('year', this._date.getFullYear().toString().padStart(4, '0') + );
		// this.setHtmlVariable('month', (this._date.getMonth() + 1).toString().padStart(2, '0'));
		// this.setHtmlVariable('day', this._date.getDate().toString().padStart(2, '0'));
	}

	_openCalendar() {
		ShowHide.show(this.get('calendar'));
	}
}

DateChooser.html = `
	<div><span id="date">{{date}}</span><span id="calendarButton" onclick="_openCalendar"></span></div>
	<div id="calendar"></div>
	`;

DateChooser.style = style;
