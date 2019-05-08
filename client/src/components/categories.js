import { UIComponent } from '../../../../app-js/src/index';

/**
 * @typedef {string|[string, Category[]]} Category
 */

export default class Categories extends UIComponent {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 */
	constructor(elem) {
		super(elem);

		this._list = this.elem.querySelector('#list');

		this.refresh();
	}

	async refresh() {
		/** @type {Category[]} */
		let categories = await window.app.ws.send({
			'command': 'get categories'
		});

		this._list.innerHTML = '';
		this._list.appendChild(this._createCategoriesElem(categories, 0));
	}

	/**
	 * @param {Category[]} categories
	 * @param {number} level
	 */
	_createCategoriesElem(categories, level) {
		const categoriesElem = document.createElement('div');
		for (let i = 0; i < categories.length; i++) {
			const category = categories[i];
			const categoryElem = document.createElement('div');
			categoryElem.id = category;
			categoryElem.innerHTML = category;
			categoriesElem.appendChild(categoryElem);
			if (i < categories.length - 1 && Array.isArray(categories[i + 1])) {
				const childrenElem = this._createCategoriesElem(categories[i + 1], level + 1);
				childrenElem.classList.add('children');
				categoriesElem.appendChild(childrenElem);
				i += 1;
			}
		}
		return categoriesElem;
	}
}

Categories.html = `
	<h1>Categories</h1>
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
	`;
