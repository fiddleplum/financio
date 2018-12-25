class Elem extends HTMLElement {
	/**
	 * Constructor.
	 * @param {string} css
	 * @param {string} html
	 */
	constructor(css, html) {
		super();

		this._css = css;
		this._html = html;
	}

	connectedCallback() {
		this.innerHTML = `<style>` + this._css + `</style>` + this._html;
		delete this._css;
		delete this._html;
	}

	/**
	 * @param {new function()} ElemClass
	 */
	static register(ElemClass) {
		// Make the tag from UpperCamelCase to tags-with-dashes
		let tag = ElemClass.name;
		for (let i = 0; i < tag.length; i++) {
			if (tag[i] === tag[i].toUpperCase()) {
				tag[i] = tag[i].toLowerCase();
			}
			if (i > 0) {
				tag = tag.slice(0, i) + '-' + tag.slice(i);
			}
		}
		window.customElements.define(tag, ElemClass);
	}

	initialize() {
		this._ws = ws;
		this._messageElement = messageElement;
		this.update();
	}

	async update() {
	}
}

window.customElements.define('elem-account-list', ElemAccountList);

export default Elem;
