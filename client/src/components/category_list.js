import { Component } from '@fiddleplum/app-js'

class CategoryList extends Component {
	/**
	 * Constructor.
	 * @param {string} gridArea
	 */
	constructor(gridArea) {
		super(gridArea);
		this._div.innerHTML = `
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
		this.__div.querySelector('#accounts').innerHTML = html;
	}
}

export default CategoryList;
