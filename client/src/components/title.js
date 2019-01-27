import Component from '../component';

class Title extends Component {
	/**
	 * Constructs the title.
	 * @param {string} gridArea
	 * @param {string} title
	 */
	constructor(gridArea, title) {
		super(gridArea);
		this.__style = `
			#title {
				text-align: center;
				font-size: 1em;
				line-height: 1.5em;
				border-bottom: 1px solid var(--color4);
			}
			`;
		this.__div.innerHTML = title;
		this.__div.id = 'title';
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
		this.__div.innerHTML = '<h1>' + title + '</h1>';
	}
}

export default Title;
