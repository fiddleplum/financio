import Util from './util';

class App {
	constructor(title) {
		window.app = this;

		document.body.innerHTML = `
			<div id="title"></div>
			<div id="view"></div>
			<div id="messages"><elem-messages></elem-messages></div>
			<div id="toolbar"></div>
			`;
		document.title = title;

		// Parse hash tag url.
		this._route = document.location.hash.split('/');
		if (this._route.length === 1 && this._route[0] === '') {
			this._route = [];
		}

		// Initialize the app.
		this.__initialize();
	}

	get route() {
		return this._route;
	}

	/**
	 * To be overridden by the subclass. Initializes the application.
	 * @protected
	 */
	async __initialize() {
		throw new Error('Not implemented.');
	}

	/**
	 * Sets the view to a new view of elemTag kind, with optional arguments.
	 * @param {string} elemTag
	 * @param {object} options
	 * @returns {HTMLElement}
	 */
	async setView(elemTag, options) {
		let elem = document.createElement(elemTag);
		elem.initialize(options);
		elem.style.display = 'none';
		elem.style.opacity = '0';
		let viewElem = document.body.querySelector('#view');
		if (viewElem.children.length > 0) {
			await Util.hideElement(viewElem.child[0], 0.25);
			viewElem.innerHTML = '';
		}
		viewElem.appendChild(elem);
		await Util.showElement(elem, 0.25);
		return elem;
	}

	/**
	 * Gets the type of app that is created.
	 * @returns {new function()}
	 */
	static getAppType() {
		return App._appType;
	}

	/**
	 * Sets the type of app that will be created. It must be a subclass of this and must be called in the script global scope.
	 * @param {new function()} AppType
	 */
	static setAppType(AppType) {
		App._appType = AppType;
	}
}

App._appType = App;

export default App;

document.addEventListener('DOMContentLoaded', () => {
	/**
	 * The main application.
	 * @type {FinancioApp}
	 */
	window.app = new App._appType();
});
