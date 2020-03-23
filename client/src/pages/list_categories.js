import { Component } from '../../../../app-js/src/index';
import html from './list_categories.html';
import css from './list_categories.css';

/** @typedef {import('../financio').default} Financio */

/**
 * @typedef {string|Array<Category>} Category
 */

/**
 * The category list page.
 */
export default class ListCategories extends Component {
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
			html += `<li id="${(prefix !== '' ? prefix + '.' : '') + categories[i]}" class="category"`;
			if (this._selected === categories[i]) {
				html += `
					><button class="grabber"
						onMouseDown="_onDragItemStart"
						onTouchStart="_onDragItemStart"
						onMouseUp="_onDragItemEnd"
						onTouchEnd="_onDragItemEnd">#</button>
					<input type="text" defaultValue=${categories[i]}></input>
					`;
			}
			else {
				html += `
						onMouseDown="_onSelectItemStart"
						onTouchStart="_onSelectItemStart"
						onMouseUp="_onSelectItemEnd"
						onTouchEnd="_onSelectItemEnd">${categories[i]}
						`;
			}
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

ListCategories.html = html;
ListCategories.css = css;
