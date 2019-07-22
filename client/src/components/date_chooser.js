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
	}
}

DateChooser.html = `
	<input id="input" type="text"/> ${dateChooserButtonSVG}
	<div id="calendar"></div>
	`;

DateChooser.style = `
	.DateChooser #input {
		width: 10rem;
	}
	.DateChooser svg {
		height: 1.5rem;
		vertical-align: bottom;
		fill: var(--fg-light);
	}
	.DateChooser #calendar {
		display: none;
	}
	`;
