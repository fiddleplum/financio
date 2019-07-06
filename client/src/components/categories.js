import { Component } from '../../../../app-js/src/index';

/**
 * @typedef {string|[string, Category[]]} Category
 */

export default class Categories extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 */
	constructor(elem) {
		super(elem);

		this._listElem = this.elem.querySelector('#list');

		this.refresh();
	}

	async refresh() {
		/** @type {Category[]} */
		let categories = await window.app.ws.send({
			'command': 'get categories'
		});

		this._listElem.innerHTML = '';
		this._createCategoriesElem(this._listElem, categories, 0);
	}

	/**
	 * @param {HTMLDivElement} categoriesElem
	 * @param {Category[]} categories
	 * @param {number} level
	 */
	_createCategoriesElem(categoriesElem, categories, level) {
		for (let i = 0; i < categories.length; i++) {
			const category = categories[i];
			const categoryElem = document.createElement('div');
			categoryElem.id = 'category_' + category;
			categoryElem.classList.add('category');
			const dragElem = document.createElement('span');
			dragElem.id = 'drag_' + category;
			dragElem.classList.add('drag');
			dragElem.innerHTML = '<svg viewBox="0 0 32 32"><use xlink:href="#3-vert-dots"></use></svg>';
			const nameElem = document.createElement('span');
			nameElem.id = 'name_' + category;
			nameElem.classList.add('name');
			nameElem.innerHTML = category;
			categoryElem.appendChild(dragElem);
			categoryElem.appendChild(nameElem);
			categoryElem.addEventListener('click', (event) => {
			});
			if (i < categories.length - 1 && Array.isArray(categories[i + 1])) {
				const childrenElem = document.createElement('div');
				childrenElem.id = 'children_' + category;
				childrenElem.classList.add('children');
				this._createCategoriesElem(childrenElem, categories[i + 1], level + 1);
				categoryElem.appendChild(childrenElem);
				i += 1;
			}
			categoriesElem.appendChild(categoryElem);
		}
		return categoriesElem;
	}
}

Categories.html = `
	<h1>Categories</h1>
	<svg style="display: block;" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
		<g id="3-vert-dots">
			<circle stroke="black" fill="black" cx="16" cy="1.5" r="1"/>
			<circle stroke="black" fill="black" cx="16" cy="16" r="1"/>
			<circle stroke="black" fill="black" cx="16" cy="30.5" r="1"/>
		</g>
	</svg>
	<div id="list"></div>
	<div class="toolbar"><!--
		--><button>+</button><!--
		--><button>→</button><!--
		--><button>←</button><!--
		--><button>↑</button><!--
		--><button>↓</button><!--
		--></div>
	`;

Categories.style = `
	.Categories div {
		margin: 1em;
	}
	.Categories #list {
		height: calc(100% - 4em - 1px);
	}
	.Categories .children {
		margin-left: 1em;
	}
	.Categories #toolbar {
		height: calc(2em + 1px);
	}
	.Categories svg {
		height: calc(1em * var(--font-cap-height));
	}
	`;
