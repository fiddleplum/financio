class Elem extends HTMLElement {
	constructor(css) {
		super();

		this._root = this.attachShadow({mode: 'open'});
		this._root.innerHTML = `
			<style>` + css + `
			</style>`;
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

	initialize(ws, messageElement) {
		this._ws = ws;
		this._messageElement = messageElement;
		this.update();
	}

	async update() {
	}
}

window.customElements.define('elem-account-list', ElemAccountList);

export default Elem;
