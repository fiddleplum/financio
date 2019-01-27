/** @typedef {import('./components/messages').default} ElemMessages */
import Util from './util';
import Router from './router';
import './components/messages';

/**
 * An abstract class for building apps.
 * @class App
 */
class App {
	/**
	 * The constructor.
	 */
	constructor() {
		window.app = this;

		/**
		 * @type {Map<string, string>}
		 * @private
		 */
		this._registeredPages = new Map();

		this._router = new Router();
	}

	/**
	 * Initializes the application.
	 */
	initialize() {
		document.body.innerHTML = `
			<style>
				:root {
					--color1: rgb(0, 47, 47);
					--color2: rgb(33, 103, 103);
					--color3: rgb(99, 150, 150);
					--color4: rgb(198, 219, 219);
					--color5: rgb(255, 255, 255);
				}
				* {
					box-sizing: border-box;
				}
				html {
					display: table;
					margin: auto;
				}
				body {
					margin: 0;
					width: 100vw;
					height: 100vh;
					font-family: 'Muli', sans-serif;
					font-size: 4vh;
				}
				body > #title {
					height: 1.333em;
					background: var(--color3);
					text-align: center;
					font-size: 1.5em;
					line-height: 1.333em;
					letter-spacing: .25em;
				}
				body > #view {
					height: calc(100% - 6em);
					background: var(--color2);
					overflow-y: scroll;
					color: var(--color4);
				}
				body > #toolbar {
					height: 2em;
					background: var(--color3);
					line-height: 2em;
				}
				body > #messages {
					height: 2em;
					background: var(--color3);
					text-align: center;
					line-height: 2em;
				}
			</style>
			<div id="title">Untitled App</div>
			<div id="view"></div>
			<div id="toolbar"></div>
			<div id="messages"><elem-messages></elem-messages></div>
			`;
		document.title = 'Untitled App';

		window.addEventListener('popstate', async (event) => {
			this.showPage(document.location.hash.substr(1));
		});
	}

	async ready() {
		await this.showPage(document.location.hash.substr(1));
	}

	/**
	 * @returns {string}
	 */
	get title() {
		return document.title;
	}

	/**
	 * @param {string} title
	 */
	set title(title) {
		document.querySelector('#title').innerHTML = title;
		document.title = title;
	}

	/**
	 * Gets the router.
	 * @returns {Router}
	 */
	get router() {
		return this._router;
	}

	/**
	 * Add a message to show to the user.
	 * @param {string} message
	 */
	showMessage(message) {
		document.querySelector('elem-messages').addMessage(message);
	}

	/**
	 * @param {string} route
	 * @param {string} elemTag
	 */
	registerPage(route, elemTag) {
		this._registeredPages.set(route, elemTag);
	}

	/**
	 * Sets the view to a new view of elemTag kind, with optional arguments.
	 * @param {string} route
	 * @returns {HTMLElement}
	 */
	async showPage(route) {
		let routeArray = route.split('/');
		if (routeArray.length === 1 && routeArray[0] === '') {
			routeArray = [];
		}

		let elemTag = '';
		if (routeArray.length === 0) {
			elemTag = this._registeredPages.get('');
		}
		else {
			elemTag = this._registeredPages.get(routeArray[0]);
		}
		if (!elemTag) {
			this.showMessage('Page ' + route + ' not found.');
			return;
		}
		console.log(route + ' -> ' + routeArray + ' -> ' + elemTag);
		let elem = document.createElement(elemTag);
		elem.style.display = 'none';
		elem.style.opacity = '0';
		if (elem.initialize) {
			elem.initialize(routeArray.shift());
		}
		let viewElem = document.querySelector('#view');
		if (viewElem.children.length > 0) {
			await Util.hideElement(viewElem.children[0], 0.25);
			viewElem.innerHTML = '';
		}
		history.pushState(undefined, '', '#' + route);
		viewElem.appendChild(elem);
		await Util.showElement(elem, 0.25);
		return elem;
	}

	/**
	 * Gets the app type.
	 * @returns {new function()};
	 */
	static get appType() {
		return this._appType;
	}

	/**
	 * Sets the app type. It must be an extension of App.
	 * @param {new function()} appType;
	 */
	static set appType(appType) {
		this._appType = appType;
	}
}

/**
 * @type {new function():App};
 */
App._appType = App;

/**
 * @type {App}
 * @global
 */
window.app = null;

(function () {
	/** @global */
	var foo = 'hello foo';
	this.foo = foo;
}).apply(window);

document.addEventListener('DOMContentLoaded', async () => {
	/**
	 * @type {number}
	 * @global
	 */
	var app = new App._appType();
	await window.app.initialize();
});

export default App;
