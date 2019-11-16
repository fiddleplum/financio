/**
 * An interval.
 * @template Type
 */
export default class Interval {
	/**
	 * Constructs an interval.
	 * @param {Type} min
	 * @param {Type} max
	 */
	constructor(min, max) {
		/**
		 * The minimum.
		 * @type {Type}
		 * @private
		 */
		this._min = min;

		/**
		 * The maximum.
		 * @type {Type}
		 * @private
		 */
		this._max = max;
	}

	/**
	 * Gets the minimum.
	 * @returns {Type}
	 */
	get min() {
		return this._min;
	}

	/**
	 * Sets the minimum.
	 * @param {Type} min
	 */
	set min(min) {
		this._min = min;
	}

	/**
	 * Gets the maximum.
	 * @returns {Type}
	 */
	get max() {
		return this._max;
	}

	/**
	 * Sets the maximum.
	 * @param {Type} max
	 */
	set max(max) {
		this._max = max;
	}

	/**
	 * Gets the size.
	 * @returns {Type}
	 */
	get size() {
		return this._max - this._min;
	}

	/**
	 * Sets the size. The maximum will be changed.
	 * @param {Type} min
	 */
	set size(size) {
		this._max = this._min + size;
	}
}
