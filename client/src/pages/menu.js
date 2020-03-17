import { Component } from '../../../../app-js/src/index';
/** @typedef {import('../financio').default} Financio */

/**
 * The menu page.
 */
export default class Menu extends Component {
	/**
	 * Constructor.
	 * @param {Component.Params} params
	 */
	constructor(params) {
		super(params);

		/**
		 * The app.
		 * @type {Financio}
		 * @private
		 */
		this._app = params.attributes.get('app');
	}

	/**
	 * The click event handler for the menu buttons.
	 * @param {Element} element
	 * @param {UIEvent} event
	 * @private
	 */
	_goToPage(element, event) {
		this._app.router.pushQuery({
			page: element.getAttribute('ref')
		});
	}
}

Menu.html = `
	<h1>Main Menu</h1>
	<button ref="listAccounts" onclick="_goToPage">Accounts</button>
	<button ref="listCategories" onclick="_goToPage">Categories</button>
	<button ref="rules" onclick="_goToPage">Rules</button>
	<button ref="budgets" onclick="_goToPage">Budgets</button>
	<button ref="reports" onclick="_goToPage">Reports</button>
	`;

Menu.css = `
	button.Menu {
		display: block;
		margin: 1rem auto;
		width: 10rem;
	}
	`;

Menu.register();
