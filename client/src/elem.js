class Elem extends HTMLElement {
	/**
	 * Constructor.
	 */
	construct() {
		super();
	}

	/**
	 * Called when the element is connected to the DOM.
	 */
	connectedCallback() {
		this.__constructHTML();
	}

	/**
	 * Constructs the HTML.
	 * @abstract
	 * @protected
	 */
	__constructHTML() {
	}

	/**
	 * Registers a subclass.
	 * @param {new function()} ElemClass
	 * @protected
	 */
	static __register(ElemClass) {
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
