import { Component, ShowHide } from '../../../../app-js/src/index';
import Selection from './selection';
import style from './date_chooser.css';

/**
 * A generic date chooser.
 */
export default class DateChooser extends Component {
	/**
	 * Constructs the app.
	 * @param {HTMLElement} elem - The element inside which thee the component will reside.
	 * @param {Date} date - The date to initially present.
	 */
	constructor(elem, date) {
		super(elem);

		this.date = date;

		this._yearSelection = new Selection(this.get('yearSelection'), (i, year) => {
			this.setHtmlVariable('year', year);
			this._date.setFullYear(parseInt(year));
			ShowHide.hide(this._yearSelection.elem);
		}, () => {
		});

		this._monthSelection = new Selection(this.get('monthSelection'), (i, month) => {
			this.setHtmlVariable('month', (i + 1).toString().padStart(2, '0'));
			this._date.setMonth(i);
			ShowHide.hide(this._monthSelection.elem);
		}, () => {
		});

		this._daySelection = new Selection(this.get('daySelection'), (i, day) => {
			this.setHtmlVariable('day', day);
			this._date.setMonth(day);
			ShowHide.hide(this._daySelection.elem);
		}, () => {
		});
	}

	/**
	 * Sets the date.
	 * @param {Date} date
	 */
	set date(date) {
		this._date = new Date(date);
		this.setHtmlVariable('year', this._date.getFullYear().toString().padStart(4, '0'));
		this.setHtmlVariable('month', (this._date.getMonth() + 1).toString().padStart(2, '0'));
		this.setHtmlVariable('day', this._date.getDate().toString().padStart(2, '0'));
	}

	_openCalendar() {
	}

	_openYearSelection() {
		const items = [];
		for (let i = 1900; i < 2100; i++) {
			items.push(i.toString());
		}
		this._yearSelection.items = items;
		ShowHide.toggle(this._yearSelection.elem);
		ShowHide.hide(this._monthSelection.elem);
		ShowHide.hide(this._daySelection.elem);
	}

	_openMonthSelection() {
		const items = [];
		items.push('01 Jan');
		items.push('02 Feb');
		items.push('03 Mar');
		items.push('04 Apr');
		items.push('05 May');
		items.push('06 Jun');
		items.push('07 Jul');
		items.push('08 Aug');
		items.push('09 Sep');
		items.push('10 Oct');
		items.push('11 Nov');
		items.push('12 Dec');
		this._monthSelection.items = items;
		ShowHide.toggle(this._monthSelection.elem);
		ShowHide.hide(this._yearSelection.elem);
		ShowHide.hide(this._daySelection.elem);
	}

	_openDaySelection() {
		const items = [];
		console.log(this._date);
		const year = this._date.getFullYear();
		const month = this._date.getMonth() + 1;
		let endDay = 30;
		if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
			endDay = 31;
		}
		else if (month === 2) {
			if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
				endDay = 29;
			}
			else {
				endDay = 28;
			}
		}
		for (let i = 1; i <= endDay; i++) {
			items.push(i.toString().padStart(2, '0'));
		}
		this._daySelection.items = items;
		ShowHide.toggle(this._daySelection.elem);
		ShowHide.hide(this._yearSelection.elem);
		ShowHide.hide(this._monthSelection.elem);
	}
}

DateChooser.html = `
	<div><span id="date">{{date}}</span><span id="calendarButton" onclick="_openCalendar"></span></div>
	<div id="calendar"></div>
	`;

DateChooser.style = style;
