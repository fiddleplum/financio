import { Component } from '@fiddleplum/app-js'

class CategoryList extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 */
	constructor(elem) {
		super(elem);
		this.__html = `
			<div class="page_title">Categories</div>
			<div id="categories"></div>
			`;
		this.refresh();
	}

	async refresh() {
		/** @type string[]} */
		let categoryNames = await window.financio.ws.send({
			'command': 'list categories'
		});

		let html = ``;
		for (let name of categoryNames) {
			html += `<div onclick="window.financio.router.pushRoute('category/` + name + `');" class="button">` + name + `</div>`;
		}
		html += `<div onclick="window.financio.router.pushRoute('categoryAdd');" class="button">+</div>`;
		this.__query('#accounts').innerHTML = html;
	}
}

export default CategoryList;
