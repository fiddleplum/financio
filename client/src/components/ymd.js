export default class YMD {
	/**
	 * Constructs the date.
	 * @param {number} [year]
	 * @param {number} [month]
	 * @param {number} [day]
	 */
	constructor(year, month, day) {
		/**
		 * The year.
		 * @type {number}
		 * @private
		 */
		this._year = year;

		/**
		 * The month.
		 * @type {number}
		 * @private
		 */
		this._month = month;

		/**
		 * The day.
		 * @type {number}
		 * @private
		 */
		this._day = day;

		if (this._year === undefined) {
			const now = new Date();
			this._year = now.getFullYear();
			this._month = now.getMonth() + 1;
			this._day = now.getDate();
		}

		// Clean it up.
		this._cleanDate();
	}

	/**
	 * Gets the year.
	 * @returns {number}
	 */
	get year() {
		return this._year;
	}

	/**
	 * Sets the year.
	 * @param {number} year
	 */
	set year(year) {
		this._year = year;
		this._cleanDate();
	}

	/**
	 * Gets the month.
	 * @returns {number}
	 */
	get month() {
		return this._month;
	}

	/**
	 * Sets the month.
	 * @param {number} month
	 */
	set month(month) {
		this._month = month;
		this._cleanDate();
	}

	/**
	 * Gets the day.
	 * @returns {number}
	 */
	get day() {
		return this._day;
	}

	/**
	 * Sets the day.
	 * @param {number} day
	 */
	set day(day) {
		this._day = day;
		this._cleanDate();
	}

	/**
	 * Copies another YMD to this.
	 * @param {YMD} ymd
	 */
	copy(ymd) {
		this._year = ymd._year;
		this._month = ymd._month;
		this._day = ymd._day;
	}

	/**
	 * Returns the day of the week, from 1 to 7.
	 * @returns {number}
	 */
	get dayOfWeek() {
		const t = [6, 2, 1, 4, 6, 2, 4, 0, 3, 5, 1, 3];
		this._year -= this._month < 3;
		return (this._year + Math.floor(this._year / 4) - Math.floor(this._year / 100) + Math.floor(this._year / 400) + t[this._month - 1] + this._day) % 7;
		// return new Date(Date.UTC(this._year, this._month, this._day)).getUTCDay();
	}

	/**
	 * Returns true if this equals the other date.
	 * @param {YMD} other
	 * @returns {boolean}
	 */
	equals(other) {
		return this._year === other._year && this._month === other._month && this._day === other._day;
	}

	/**
	 * Converts this to a number guaranteed to be unique and well-ordered compared to other YMD objects.
	 * @returns {number}
	 */
	valueOf() {
		return this._year * 12 * 31 + this._month * 31 + this._day;
	}

	/**
	 * Returns the number of days in this month.
	 * @return {number}
	 */
	get daysInMonth() {
		return YMD.daysInMonth(this._year, this._month);
	}

	/**
	 * Returns the number of days in the month.
	 * @param {number} year
	 * @param {number} month
	 * @return {number}
	 */
	static daysInMonth(year, month) {
		if ([1, 3, 5, 7, 8, 10, 12].includes(this._month)) {
			return 31;
		}
		else if (this._month === 2) {
			return this.isLeapYear() ? 29 : 28;
		}
		else {
			return 30;
		}
	}

	/**
	 * Returns true if this date is in a leap year.
	 * @returns {boolean}
	 */
	get isLeapYear() {
		return YMD.isLeapYear(this._year);
	}

	/**
	 * Returns true if the year is a leap year.
	 * @param {number} year
	 * @returns {boolean}
	 */
	static isLeapYear(year) {
		return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	}

	/**
	 * Returns a new date object.
	 * @param {string|string[]} [locales]
	 * @param {Intl.DateTimeFormatOptions} [options]
	 * @returns {string}
	 */
	toString(locales, options) {
		return new Date(this._year, this._month, this._day, 0, 0, 0, 0).toLocaleDateString(locales, options);
	}

	/**
	 * Cleans up the date to be valid.
	 * @private
	 */
	_cleanDate() {
		if (!Number.isFinite(this._year) || !Number.isFinite(this._month) || !Number.isFinite(this._day)) {
			return;
		}
		while (this._month < 1) {
			this._year -= 1;
			this._month += 12;
		}
		if (this._month > 12) {
			this._month -= 12;
			this._year += 1;
		}
		while (this._day < 1) {
			this._month -= 1;
			if (this._month < 1) {
				this._year -= 1;
				this._month += 12;
			}
			this._day += this.daysInMonth;
		}
		while (true) {
			const daysInMonth = this.daysInMonth;
			if (this._day <= daysInMonth) {
				break;
			}
			this._day -= daysInMonth;
			this._month += 1;
			if (this._month > 12) {
				this._month -= 12;
				this._year += 1;
			}
		}
	}
}
