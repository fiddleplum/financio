import { Component } from '../../../../app-js/src/index'

class Title extends Component {
	/**
	 * Constructs the title.
	 * @param {HTMLElement} element
	 * @param {string} title
	 */
	constructor(element, title) {
		super(element);

		/**
		 * The title text.
		 * @type {string}
		 * @private
		 */
		this._title = title;

		// Set the html to the title.
		this.__html = title;
	}

	/**
	 * Gets the title.
	 * @returns {string}
	 */
	get title() {
		return this._title;
	}

	/**
	 * Sets the title.
	 * @param {string} title
	 */
	set title(title) {
		this._title = title;
		this.__html = title;
	}
}

Title.__style = `
	.Title {
		text-align: center;
		font-size: 1em;
		line-height: 2em;
		background: var(--bg-dark);
		color: var(--fg-dark);
	}
	`;

export default Title;
