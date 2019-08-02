import { Container } from '../../../../app-js/src/index';
import Calendar from './calendar';
import dateChooserButtonSVG from './date_chooser_button.svg';

export default class DateChooser extends Container {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 */
	constructor(elem, date) {
		super(elem);

		this._date = new Date(date);

		this._calendar = this.__setComponent(Calendar, 'calendar', this._date);

		this.on('calendar', 'click', (event) => {
			this.elem.querySelector('.calenderButton')
		});
	}

	get date() {

	}
}

DateChooser.html = `
	<input class="input" type="text"/> <span class="calenderButton">${dateChooserButtonSVG}</span>
	<div class="calendar"></div>
	`;

DateChooser.style = `
	.DateChooser .input {
		width: 6rem;
		max-width: calc(100% - 2.0rem);
	}
	.DateChooser svg {
		height: 1.5rem;
		vertical-align: bottom;
		fill: var(--fg-light);
	}
	.DateChooser .calendar {
		display: none;
	}
	`;
