import { Component } from '../../../../app-js/src/index';
/** @typedef {import('../index').default} FinancioApp */

export default class MainMenu extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 * @param {FinancioApp} app
	 */
	constructor(elem, app) {
		super(elem);

		/**
		 * A reference to the app.
		 * @type {FinancioApp}
		 * @private
		 */
		this._app = app;

		this.elem.querySelector('#accounts').addEventListener('click', () => {
			this._app.query.push({ section: 'accounts' });
		});
		this.elem.querySelector('#categories').addEventListener('click', () => {
			this._app.query.push({ section: 'categories' });
		});
		this.elem.querySelector('#rules').addEventListener('click', () => {
			this._app.query.push({ section: 'rules' });
		});
		this.elem.querySelector('#budgets').addEventListener('click', () => {
			this._app.query.push({ section: 'budgets' });
		});
		this.elem.querySelector('#reports').addEventListener('click', () => {
			this._app.query.push({ section: 'reports' });
		});
	}
}

MainMenu.html = `
	<h1>Main Menu</h1>
	<div class="button" id="accounts">Accounts</div>
	<div class="button" id="categories">Categories</div>
	<div class="button" id="rules">Rules</div>
	<div class="button" id="budgets">Budgets</div>
	<div class="button" id="reports">Reports</div>
	`;
