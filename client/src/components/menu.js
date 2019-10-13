import { Component } from '../../../../app-js/src/index';
import style from './menu.css';
/** @typedef {import('../financio').default} Financio */

/**
 * The menu page.
 */
export default class Menu extends Component {
	/**
	 * Constructs the app.
	 * @param {HTMLElement} elem - The element inside which thee the component will reside.
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

		// Register event handlers.
		this.on('accounts', 'click', this._goToPage);
		this.on('categories', 'click', this._goToPage);
		this.on('rules', 'click', this._goToPage);
		this.on('budgets', 'click', this._goToPage);
		this.on('reports', 'click', this._goToPage);
	}

	/**
	 * The click event handler for the menu buttons.
	 * @param {UIEvent} event
	 * @private
	 */
	_goToPage(event) {
		this._financio.router.push({
			page: event.target.id
		});
	}
}

Menu.html = `
	<h1>Main Menu</h1>
	<button id="accounts">Accounts</button>
	<button id="categories">Categories</button>
	<button id="rules">Rules</button>
	<button id="budgets">Budgets</button>
	<button id="reports">Reports</button>
	`;

Menu.style = style;
