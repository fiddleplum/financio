/** A year, month and day object. */
export class YMD {
	/** The year. */
	private _year = 2000;

	/** The month. */
	private _month = 1;

	/** The day. */
	private _day = 1;

	constructor(year?: number | YMD | string, month?: number, day?: number) {
		if (year === undefined) { // Nothing defined so use today.
			const now = new Date();
			this._year = now.getFullYear();
			this._month = now.getMonth() + 1;
			this._day = now.getDate();
		}
		else if (typeof year === 'string') {
			this._year = parseInt(year.substr(0, 4));
			this._month = parseInt(year.substr(5, 2));
			this._day = parseInt(year.substr(8, 2));
		}
		else if (year instanceof YMD) { // YMD given so copy.
			this._year = year._year;
			this._month = year._month;
			this._day = year._day;
		}
		else if (month === undefined) { // Single number given so convert it.
			this._year = Math.floor(year / 12 / 31);
			this._month = Math.floor((year % (12 * 31)) / 31);
			this._day = year % 31;
		}
		else { // Actual params given.
			this._year = year;
			this._month = month;
			if (day !== undefined) {
				this._day = day;
			}
		}

		// Clean it up.
		this._cleanDate();
	}

	/** Gets the year. */
	get year(): number {
		return this._year;
	}

	/** Sets the year. */
	set year(year: number) {
		this._year = year;
		this._cleanDate();
	}

	/** Gets the month. */
	get month(): number {
		return this._month;
	}

	/** Sets the month. */
	set month(month: number) {
		this._month = month;
		this._cleanDate();
	}

	/** Gets the day. */
	get day(): number {
		return this._day;
	}

	/** Sets the day. */
	set day(day: number) {
		this._day = day;
		this._cleanDate();
	}

	/** Copies another YMD to this. */
	copy(ymd: YMD | number): void {
		if (ymd instanceof YMD) {
			this._year = ymd._year;
			this._month = ymd._month;
			this._day = ymd._day;
		}
		else { // number
			this._year = Math.floor(ymd / 12 / 31);
			this._month = Math.floor((ymd % (12 * 31)) / 31);
			this._day = ymd % 31;
		}
	}

	/** Returns the day of the week, from 1 to 7. */
	get dayOfWeek(): number {
		const t = [6, 2, 1, 4, 6, 2, 4, 0, 3, 5, 1, 3];
		const year = (this._month < 3 ? this._year - 1 : this._year);
		return (year + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400) + t[this._month - 1] + this._day) % 7;
	}

	/** Returns true if this equals the other date. */
	equals(other: YMD): boolean {
		return this._year === other._year && this._month === other._month && this._day === other._day;
	}

	/** Returns the maximum of this or the other date. */
	max(other: YMD): YMD {
		if (this >= other) {
			return this;
		}
		return other;
	}

	/** Returns the maximum of this or the other date. */
	min(other: YMD): YMD {
		if (this <= other) {
			return this;
		}
		return other;
	}

	/** Returns the number of days in this month. */
	get daysInMonth(): number {
		return YMD.daysInMonth(this._year, this._month);
	}

	/** Returns the number of days in the month. */
	static daysInMonth(year: number, month: number): number {
		if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
			return 31;
		}
		else if (month === 2) {
			return this.isLeapYear(year) ? 29 : 28;
		}
		else {
			return 30;
		}
	}

	/** Returns true if this date is in a leap year. */
	get isLeapYear(): boolean {
		return YMD.isLeapYear(this._year);
	}

	/** Returns true if the year is a leap year. */
	static isLeapYear(year: number): boolean {
		return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	}

	/** Converts this to a number guaranteed to be unique and well-ordered compared to other YMD objects. */
	valueOf(): number {
		return this._year * 12 * 31 + this._month * 31 + this._day;
	}

	/** Returns a string with the given locale and options, the same as the Date object. */
	toLocaleString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string {
		return new Date(this._year, this._month - 1, this._day, 0, 0, 0, 0).toLocaleDateString(locales, options);
	}

	/** Returns a string in the form YYYY-MM-DD. */
	toString(): string {
		return (this._year + '').padStart(4, '0') + '-' + (this._month + '').padStart(2, '0') + '-' + (this._day + '').padStart(2, '0');
	}

	/** Cleans up the date to be valid. */
	private _cleanDate(): void {
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
