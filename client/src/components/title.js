import { UIComponent } from '../../../../app-js/src/index';

export default class Title extends UIComponent {
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
		this.title = title;
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
		this.elem.innerHTML = '<a href="">' + title + '</a>';
	}
}

Title.style = `
	.Title {
		text-align: center;
		font-size: 1em;
		line-height: 2em;
		background: var(--bg-dark);
		color: var(--fg-dark);
	}

	.Title a {
		color: var(--fg-dark);
	`;
