/** @typedef {import('./index').default} FinancioApp */
/** @typedef {import('./ws').default} WS */
// import Data from './data';

class ElemAccountView extends HTMLElement {
	constructor() {
		super();

		/**
		 * @type {string}
		 * @private
		 */
		this._name = '';
	}

	/**
	 * @param {string[]} route
	 */
	initialize(route) {
		if (route.length > 0) {
			this._name = route[0];
		}
	}

	connectedCallback() {
		this.innerHTML = `
			<style>
				elem-account-view .button {
					display: block;
					margin-bottom: .5em;
				}
			</style>
			<div class="page_title">` + this._name + `</div>
			<elem-transaction-list></elem-transaction-list>
			`;
	}
}

window.customElements.define('elem-account-view', ElemAccountView);

export default ElemAccountView;
