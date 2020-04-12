/** An interval. */
export class Interval<Type> {
	/** The minimum. */
	public min: Type;

	/** The maximum. */
	public max: Type;

	constructor(min: Type, max: Type) {
		this.min = min;
		this.max = max;
	}
}
