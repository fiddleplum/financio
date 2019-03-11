import { Component } from '@fiddleplum/app-js'

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

		this.__style = `
			.Title {
				text-align: center;
				font-size: 1em;
				line-height: 2em;
				background: var(--bg-dark);
				color: var(--fg-dark);
			}
			`;
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

export default Title;
