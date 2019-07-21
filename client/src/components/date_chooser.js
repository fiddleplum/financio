import { Component } from '../../../../app-js/src/index';

export default class DateChooser extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 */
	constructor(elem) {
		super(elem);

		this._startDate = new Date(1950, 0, 1);

		this._endDate = new Date(2050, 0, 1);

		this._currentDate = new Date(Number.NaN, Number.NaN, 1);
		this.setToDate(new Date());

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

	setToDate(date) {
		let daysNeedUpdate = false;
		if (this._currentDate.getFullYear() !== date.getFullYear()) {
			this._currentDate.setFullYear(date.getFullYear());
			this.setRenderVar('year', this._currentDate.getFullYear().toString());
			daysNeedUpdate = true;
		}
		if (this._currentDate.getMonth() !== date.getMonth()) {
			this._currentDate.setMonth(date.getMonth());
			this.setRenderVar('month', DateChooser._monthNames[this._currentDate.getMonth()]);
			daysNeedUpdate = true;
		}
		if (daysNeedUpdate) {
			const date = new Date(this._currentDate);
			date.setDate(1 - this._currentDate.getDay());
			for (let i = 0; i < 42; i++, date.setDate(date.getDate() + 1)) {
				const dayElem = this.elem.querySelector('#day_' + i.toString());
				if (date.getMonth() === this._currentDate.getMonth()) {
					dayElem.classList.remove('unday');
				}
				else {
					dayElem.classList.add('unday');
				}
				dayElem.innerHTML = date.getDate().toString();
			}
		}
	}

	_offsetDate(years, months) {
		const newDate = new Date(this._currentDate);
		newDate.setFullYear(newDate.getFullYear() + years);
		newDate.setMonth(newDate.getMonth() + months);
		if (newDate < this._startDate) {
			this.setToDate(this._startDate);
		}
		else if (newDate > this._endDate) {
			this.setToDate(this._endDate);
		}
		else {
			this.setToDate(newDate);
		}
	}

	_getDaysInMonth(date) {
		const month = date.getMonth();
		if ([0, 2, 4, 6, 7, 9, 11].includes(month)) {
			return 31;
		}
		else if (month === 1) {
			const year = date.getFullYear();
			if (year % 4 === 0 && year % 100 !== 0) {
				return 29;
			}
			else return 28;
		}
		else {
			return 30;
		}
	}
}

DateChooser.html = `
	<div id="decade_dec" class="clickable inline-vertical-align">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="20,4 4,16 20,27" />
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="28,4 12,16 28,27" />
		</svg>
	</div>
	<div id="year_dec" class="clickable inline-vertical-align">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="24,4 8,16 24,27" />
		</svg>
	</div>
	<div id="year_current" class="inline-vertical-align">{{year}}</div>
	<div id="year_inc" class="clickable inline-vertical-align">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="8,4 24,16 8,27" />
		</svg>
	</div>
	<div id="decade_inc" class="clickable inline-vertical-align">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="12,4 28,16 12,27" />
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="4,4 20,16 4,27" />
		</svg>
	</div>
	<div id="month_dec" class="clickable inline-vertical-align">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="24,4 8,16 24,27" />
		</svg>
	</div>
	<div id="month_current" class="inline-vertical-align">{{month}}</div>
	<div id="month_inc" class="clickable inline-vertical-align">
		<svg viewBox="0 0 32 32">
			<polyline stroke="var(--fg-light)" stroke-width="2" fill="none" points="8,4 24,16 8,27" />
		</svg>
	</div>
	<div class="inline-vertical-align week">S</div>
	<div class="inline-vertical-align week">M</div>
	<div class="inline-vertical-align week">T</div>
	<div class="inline-vertical-align week">W</div>
	<div class="inline-vertical-align week">T</div>
	<div class="inline-vertical-align week">F</div>
	<div class="inline-vertical-align week">S</div>
	<div id="day_0" class="clickable inline-vertical-align"></div>
	<div id="day_1" class="clickable inline-vertical-align"></div>
	<div id="day_2" class="clickable inline-vertical-align"></div>
	<div id="day_3" class="clickable inline-vertical-align"></div>
	<div id="day_4" class="clickable inline-vertical-align"></div>
	<div id="day_5" class="clickable inline-vertical-align"></div>
	<div id="day_6" class="clickable inline-vertical-align"></div>
	<div id="day_7" class="clickable inline-vertical-align"></div>
	<div id="day_8" class="clickable inline-vertical-align"></div>
	<div id="day_9" class="clickable inline-vertical-align"></div>
	<div id="day_10" class="clickable inline-vertical-align"></div>
	<div id="day_11" class="clickable inline-vertical-align"></div>
	<div id="day_12" class="clickable inline-vertical-align"></div>
	<div id="day_13" class="clickable inline-vertical-align"></div>
	<div id="day_14" class="clickable inline-vertical-align"></div>
	<div id="day_15" class="clickable inline-vertical-align"></div>
	<div id="day_16" class="clickable inline-vertical-align"></div>
	<div id="day_17" class="clickable inline-vertical-align"></div>
	<div id="day_18" class="clickable inline-vertical-align"></div>
	<div id="day_19" class="clickable inline-vertical-align"></div>
	<div id="day_20" class="clickable inline-vertical-align"></div>
	<div id="day_21" class="clickable inline-vertical-align"></div>
	<div id="day_22" class="clickable inline-vertical-align"></div>
	<div id="day_23" class="clickable inline-vertical-align"></div>
	<div id="day_24" class="clickable inline-vertical-align"></div>
	<div id="day_25" class="clickable inline-vertical-align"></div>
	<div id="day_26" class="clickable inline-vertical-align"></div>
	<div id="day_27" class="clickable inline-vertical-align"></div>
	<div id="day_28" class="clickable inline-vertical-align"></div>
	<div id="day_29" class="clickable inline-vertical-align"></div>
	<div id="day_30" class="clickable inline-vertical-align"></div>
	<div id="day_31" class="clickable inline-vertical-align"></div>
	<div id="day_32" class="clickable inline-vertical-align"></div>
	<div id="day_33" class="clickable inline-vertical-align"></div>
	<div id="day_34" class="clickable inline-vertical-align"></div>
	<div id="day_35" class="clickable inline-vertical-align"></div>
	<div id="day_36" class="clickable inline-vertical-align"></div>
	<div id="day_37" class="clickable inline-vertical-align"></div>
	<div id="day_38" class="clickable inline-vertical-align"></div>
	<div id="day_39" class="clickable inline-vertical-align"></div>
	<div id="day_40" class="clickable inline-vertical-align"></div>
	<div id="day_41" class="clickable inline-vertical-align"></div>
	`;

DateChooser.style = `
	.DateChooser {
		width: 14rem;
		height: 13.5rem;
		border: 1px solid var(--fg-light);
		border-radius: .5rem;
		display: grid;
		grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
		cursor: default;
	}
	.DateChooser #year_current {
		grid-column-start: 3;
		grid-column-end: 6;
	}
	.DateChooser #month_current {
		grid-column-start: 2;
		grid-column-end: 7;
	}
	.DateChooser svg {
		height: 1rem;
	}
	.DateChooser .clickable {
		cursor: pointer;
	}
	.DateChooser .clickable:hover {
		font-weight: bold;
		font-size: 1.25rem;
		line-height: 1rem;
	}
	.DateChooser .clickable:hover svg {
		height: 1.25rem;
	}
	.DateChooser .clickable:hover svg polyline {
		stroke-width: 4;
	}
	.DateChooser .week {
		border-bottom: 1px solid var(--fg-light);
	}
	.DateChooser .unday {
		color: var(--fg-light-disabled);
	}
	`;

DateChooser._monthNames = [
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
