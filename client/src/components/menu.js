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
	}

	/**
	 * The click event handler for the menu buttons.
	 * @param {UIEvent} event
	 * @private
	 */
	_goToPage(event) {
		this._financio.router.pushQuery({
			page: event.target.id
		});
	}
}

Menu.html = `
	<h1>Main Menu</h1>
	<button id="accounts" onclick="_goToPage">Accounts</button>
	<button id="categories" onclick="_goToPage">Categories</button>
	<button id="rules" onclick="_goToPage">Rules</button>
	<button id="budgets" onclick="_goToPage">Budgets</button>
	<button id="reports" onclick="_goToPage">Reports</button>
	`;

Menu.style = style;
