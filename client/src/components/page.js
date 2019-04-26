import { UIComponent } from '../../../../app-js/src/index';

export default class Page extends UIComponent {
	/**
	 * Constructs a component inside the parent element.
	 * @param {HTMLElement} elem
	 */
	constructor(elem) {
		super(elem);

		/**
		 * The left panel.
		 * @type {UIComponent}
		 * @private
		 */
		this._leftPanel = null;

		/**
		 * The main panel.
		 * @type {UIComponent}
		 * @private
		 */
		this._mainPanel = null;

		/**
		 * The right panel.
		 * @type {UIComponent}
		 * @private
		 */
		this._rightPanel = null;
	}

	/**
	 * Gets the left panel.
	 * @returns {UIComponent}
	 */
	getLeftPanel() {
		return this._leftPanel;
	}

	/**
	 * Sets the left panel.
	 * @param {function():UIComponent} UIComponentType
	 * @param {...object} options
	 */
	setLeftPanel(UIComponentType, ...options) {
		if (this._leftPanel !== null) {
			this._leftPanel.destroy();
			this._leftPanel = null;
		}
		if (UIComponentType !== null) {
			this._leftPanel = new UIComponentType(this.elem.querySelector('#leftPanel'), ...options);
		}
	}

	/**
	 * Gets the main panel.
	 * @returns {UIComponent}
	 */
	getMainPanel() {
		return this._mainPanel;
	}

	/**
	 * Sets the main panel.
	 * @param {function():UIComponent} UIComponentType
	 * @param {...object} options
	 */
	setMainPanel(UIComponentType, ...options) {
		if (this._mainPanel !== null) {
			this._mainPanel.destroy();
			this._mainPanel = null;
		}
		if (UIComponentType !== null) {
			this._mainPanel = new UIComponentType(this.elem.querySelector('#mainPanel'), ...options);
		}
	}

	/**
	 * Gets the right panel.
	 * @returns {UIComponent}
	 */
	getRightPanel() {
		return this._rightPanel;
	}

	/**
	 * Sets the right panel.
	 * @param {function():UIComponent} UIComponentType
	 * @param {...object} options
	 */
	setRightPanel(UIComponentType, ...options) {
		if (this._rightPanel !== null) {
			this._rightPanel.destroy();
			this._rightPanel = null;
		}
		if (UIComponentType !== null) {
			this._rightPanel = new UIComponentType(this.elem.querySelector('#rightPanel'), ...options);
		}
	}

	/**
	 * Gets the right panel.
	 * @returns {UIComponent}
	 */
	getFooter() {
		return this._footer;
	}

	/**
	 * Sets the right panel.
	 * @param {function():UIComponent} UIComponentType
	 * @param {...object} options
	 */
	setFooter(UIComponentType, ...options) {
		if (this._footer !== null) {
			this._footer.destroy();
			this._footer = null;
		}
		if (UIComponentType !== null) {
			this._footer = new UIComponentType(this.elem.querySelector('#footer'), ...options);
		}
	}
}

Page.style = `
	.Page {
		margin: 0;
		width: 100vw;
		height: 100%;
		display: grid;
		grid-template-columns: 20em 1fr 20em;
		grid-template-rows: 2em 2em 1fr 2em;
		grid-template-areas:
			"title title title"
			"message message message"
			"leftPanel mainPanel rightPanel"
			"footer footer footer";
		background: var(--bg-light);
		color: var(--fg-light);
	}
	.Page > #title {
		grid-area: title;
		text-align: center;
		font-size: 1em;
		line-height: 2em;
		background: var(--bg-dark);
		color: var(--fg-dark);
	}
	.Page > #title a {
		color: var(--fg-dark);
	}
	.Page > #message {
		grid-area: message;
		text-align: center;
		font-size: 1em;
		line-height: calc(2em - 1px);
		border-bottom: 1px solid var(--bg-dark);
	}
	.Page > #leftPanel {
		grid-area: leftPanel;
	}
	.Page > #mainPanel {
		grid-area: mainPanel;
	}
	.Page > #rightPanel {
		grid-area: rightPanel;
	}
	.Page > #footer {
		grid-area: footer;
	}
	`;

Page.html = `
	<div id="title"></div>
	<div id="message"></div>
	<div id="leftPanel"></div>
	<div id="mainPanel"></div>
	<div id="rightPanel"></div>
	<div id="footer"></div>
	`;
