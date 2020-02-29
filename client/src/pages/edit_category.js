import { Component } from '../../../../app-js/src/index';
/** @typedef {import('../financio').default} Financio */

/**
 * The categories page.
 */
export default class EditCategory extends Component {
	/**
	 * Constructs the app.
	 * @param {HTMLElement} elem - The element inside which the component will reside.
	 * @param {Financio} financio - The app.
	 */
	constructor(elem, financio) {
		super(elem);

		/**
		 * The app.
		 * @type {Financio}
		 * @private
		 */
		this._financio = financio;

		/**
		 * The list of account names.
		 * @type {Array<Category>}
		 */
		this._categories = [];

		/**
		 * The currently selected category.
		 * @type {string}
		 */
		this._selected = '';

		/**
		 * If something has changed, this is true.
		 * @type {boolean}
		 */
		this._modified = false;

		this._financio.server.send({
			command: 'get categories'
		}).then((categories) => {
			this._categories = categories;
			this.setHtml('list', this._renderCategories('', this._categories, 0));
		});
	}

	_renderCategories(prefix, categories, level) {
		let html = '';
		for (let i = 0; i < categories.length; i++) {
			html += `<li id="${(prefix !== '' ? prefix + '.' : '') + categories[i]}" class="category" onclick="_onclick"`>${categories[i]};
			if (i < categories.length - 1 && Array.isArray(categories[i + 1])) { // Category with sub-categories
				html += `<ul>`;
				html += `${this._renderCategories((prefix !== '' ? (prefix + '.') : '') + categories[i], categories[i + 1], level + 1)}`;
				html += `</ul>`;
				i += 1;
			}
			html += `</li>`;
		}
		return html;
	}

	_onDragItemStart(event) {
		
	}

	_onDragItemEnd(event) {
	}

	_onSelectItemStart(event) {
		console.error('select item start ' + event.target.id);
		this._selected = event.target.id;
	}

	_onSelectItemEnd(event) {
		console.error('select item end');
	}
}

EditCategory.html = `
	<h1>Edit Category</h1>
	<p><button>Save</button></p>
	<p>Name: <input type="text" id="name"/>
	`;

Component.register(CategoriesEdit);
