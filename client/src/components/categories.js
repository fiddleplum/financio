import { Component } from '../../../../app-js/src/index';

export default class Categories extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 */
	constructor(elem) {
		super(elem);
		this.refresh();
	}

	async refresh() {
		/** @type string[]} */
		let categories = await window.app.ws.send({
			'command': 'get categories'
		});

		let html = ``;
		for (let category of categories) {
			html += `<div>` + category + `</div>`;
		}
		html += `<div onclick="window.app.router.pushRoute('categories/add');" class="button">+</div>`;
		this.elem.querySelector('#categories').innerHTML = html;
	}
}

Categories.style = `
	.Categories #list {
		height: calc(100% - 2em);
	}
	`;

Categories.html = `
	<div class="page_title">Categories</div>
	<div id="list"></div>
	<div id="toolbar"></div>
	`;
