import { Component, ShowHide } from '../../../../app-ts/src/index';
import { YMD, Calendar } from '../internal';

/** A generic date chooser. */
export default class DateChooser extends Component {
	/** The displayed date. */
	private _date = new YMD();

	/** The calendar component. */
	private _calendar: Calendar;

	constructor(params: Component.Params) {
		super(params);

		/** The calendar. */
		this._calendar = this.__component('calendar') as Calendar;

		this._onClickInsideCalendar = this._onClickInsideCalendar.bind(this);
		this._onClickOutsideCalendar = this._onClickOutsideCalendar.bind(this);
	}

	__destroy(): void {
		window.removeEventListener('click', this._onClickOutsideCalendar);
	}

	/** Gets the date. */
	get date(): YMD {
		return this._date;
	}

	/** Sets the date. */
	set date(date: YMD) {
		this._date.copy(date);
		(this.__element('date') as HTMLInputElement).value = this._date.toString();
		// this.get('year').value = this._date.year;
		// this.get('month').value = this._date.month;
		// this.get('day').value = this._date.day;
	}

	private _onDateSelected(date: YMD): void {
		this.date = date;
		this._calendar.select(this._date);
		ShowHide.hide(this._calendar.root as HTMLElement);
	}

	private _onDateChange(): void {
		try {
			// const year = parseInt(this.get('year').value);
			// const month = parseInt(this.get('month').value);
			// const day = parseInt(this.get('day').value);
			const date = new YMD((this.__element('date') as HTMLInputElement).value);
			this._date.copy(date);
		}
		catch (e) {
			this._date.year = Number.NaN;
			this._date.month = Number.NaN;
			this._date.day = Number.NaN;
		}
	}

	private _toggleCalendar(event: MouseEvent): void {
		this._calendar.clearSelections();
		const calendarRoot = this._calendar.root as HTMLElement;
		if (ShowHide.isHidden(calendarRoot)) {
			this._calendar.select(this._date);
			ShowHide.show(calendarRoot);
			calendarRoot.addEventListener('click', this._onClickInsideCalendar);
			window.addEventListener('click', this._onClickOutsideCalendar);
		}
		else {
			calendarRoot.removeEventListener('click', this._onClickInsideCalendar);
			window.removeEventListener('click', this._onClickOutsideCalendar);
			ShowHide.hide(calendarRoot);
		}
		event.stopPropagation();
	}

	private _onClickInsideCalendar(event: MouseEvent): void {
		event.stopPropagation();
	}

	private _onClickOutsideCalendar(): void {
		ShowHide.hide(this._calendar.root as HTMLElement);
	}

	/** On the date input key down event. */
	private _onDateInputKeyDown(event: KeyboardEvent): void {
		const input = event.target as HTMLInputElement;
		if (input.selectionStart === null) {
			return;
		}
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

	/** On the date input changing content. */
	private _onDateInputInput(event: InputEvent | KeyboardEvent): void {
		/** @type {HTMLInputElement} */
		const input = event.target as HTMLInputElement;
		if (input.selectionStart === null) {
			return;
		}
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

DateChooser.html = /*html*/`
	<span>
		<input ref="date" class="date" type="text" placeholder="YYYY-MM-DD" maxlength=10 title="Please use the format YYYY-MM-DD" pattern="\\d\\d\\d\\d-\\d\\d-\\d\\d" onkeydown="_onDateInputKeyDown" oninput="_onDateInputInput" onchange="_onDateChange"/><button onclick="_toggleCalendar"><icon src="svg/calendar.svg" /></button>
		<Calendar ref="calendar" style="display: none;" onclick="{{_onDateSelected}}"/>
	</span>
	`;

DateChooser.css = /*css*/`
	.DateChooser .date {
		width: 7rem;
		text-align: left;
		margin-right: .25rem;
	}

	.DateChooser > .Calendar {
		margin-top: .25rem;
	}
	`;

DateChooser.register();
