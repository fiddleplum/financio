import { Component, ShowHide } from '../../../../app-js/src/index';
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
	 */
	constructor(elem) {
		super(elem);

		/**
		 * The displayed date.
		 * @type {YMD}
		 * @private
		 */
		this._date = new YMD();

		/**
		 * The calendar.
		 * @type {Calendar}
		 * @private
		 */
		this._calendar = this.getComponent('calendar');

		this._onClickInsideCalendar = this._onClickInsideCalendar.bind(this);
		this._onClickOutsideCalendar = this._onClickOutsideCalendar.bind(this);

		// Setup the click callback for the calendar.
		this._calendar.clickCallback = (date) => {
			this.date = date;
			this._calendar.select(this._date);
			ShowHide.hide(this._calendar.elem);
		};
	}

	destroy() {
		window.removeEventListener('click', this._onClickOutsideCalendar);
	}

	/**
	 * Gets the date.
	 * @returns {YMD}
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
		// this.get('year').value = this._date.year;
		// this.get('month').value = this._date.month;
		// this.get('day').value = this._date.day;
	}

	_onDateChange() {
		try {
			// const year = parseInt(this.get('year').value);
			// const month = parseInt(this.get('month').value);
			// const day = parseInt(this.get('day').value);
			const date = new YMD(this.get('date').value);
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
		this._calendar.clearSelections();
		if (ShowHide.isHidden(this._calendar.elem)) {
			console.log(this._date);
			this._calendar.select(this._date);
			ShowHide.show(this._calendar.elem);
			this._calendar.elem.addEventListener('click', this._onClickInsideCalendar);
			window.addEventListener('click', this._onClickOutsideCalendar);
		}
		else {
			this._calendar.elem.removeEventListener('click', this._onClickInsideCalendar);
			window.removeEventListener('click', this._onClickOutsideCalendar);
			ShowHide.hide(this._calendar.elem);
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

	/**
	 * On the date input key down event
	 * @param {KeyboardEvent} event
	 */
	_onDateInputKeyDown(event) {
		const input = event.target;
		const cursor = input.selectionStart;
		if (input.selectionEnd !== cursor) {
			return;
		}
		if (event.key === 'Delete') {
			if (input.value[cursor] === '-') {
				input.selectionStart++;
			}
		}
		else if (event.key === 'Backspace') {
			if (cursor > 0 && input.value[cursor - 1] === '-') {
				input.selectionEnd--;
			}
		}
		else if (event.key === 'ArrowRight') {
			if (cursor === 3 || cursor === 6) {
				input.selectionStart++;
			}
		}
		else if (event.key === 'ArrowLeft') {
			if (cursor === 5 || cursor === 8) {
				input.selectionEnd--;
			}
		}
		this._onDateInputInput(event);
	}

	/**
	 * On the date input changing content.
	 * @param {InputEvent} event
	 * @private
	 */
	_onDateInputInput(event) {
		/** @type {HTMLInputElement} */
		const input = event.target;
		let cursor = input.selectionStart;
		const value = [...input.value];
		for (let i = 0; i < value.length; i++) {
			if ((0 <= i && i <= 3) || (5 <= i && i <= 6) || (8 <= i && i <= 9)) {
				if (value[i] < '0' || '9' < value[i]) {
					value.splice(i, 1);
					if (cursor > i) {
						cursor--;
					}
					i--;
				}
			}
			else if (i === 4 || i === 7) {
				if (value[i] === '-' && i === value.length - 1) { // If there is a dash on the last one, remove it.
					value.splice(i, 1);
					if (cursor > i) {
						cursor--;
					}
					i--;
				}
				else if (value[i] !== '-') {
					value.splice(i, 0, '-');
					if (cursor >= i) {
						cursor++;
					}
					i++;
				}
			}
		}
		input.value = value.join('');
		input.selectionEnd = cursor;
	}
}

DateChooser.html = `
	<input id="date" type="text" placeholder="YYYY-MM-DD" maxlength=10 title="Please use the format YYYY-MM-DD" pattern="\\d\\d\\d\\d-\\d\\d-\\d\\d" onkeydown="_onDateInputKeyDown" oninput="_onDateInputInput" onchange="_onDateChange"/><button onclick="_toggleCalendar">${calendarSVG}</button>
	<Calendar id="calendar" style="display: none;" />
	`;

DateChooser.style = `
	.DateChooser > #date {
		width: 7rem;
		text-align: center;
		margin-right: .25rem;
	}

	.DateChooser > #Calendar {
		margin-top: .25rem;
	}
	`;

DateChooser.register();
