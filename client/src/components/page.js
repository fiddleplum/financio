import { Component } from '../../../../app-js/src/index';

export default class Page extends Component {
	/**
	 * Constructs a component inside the parent element.
	 * @param {HTMLElement} elem
	 */
	constructor(elem) {
		super(elem);

		/**
		 * The left panel.
		 * @type {Component}
		 * @private
		 */
		this._leftPanel = null;

		/**
		 * The main panel.
		 * @type {Component}
		 * @private
		 */
		this._mainPanel = null;

		/**
		 * The right panel.
		 * @type {Component}
		 * @private
		 */
		this._rightPanel = null;
	}

	/**
	 * Gets the left panel.
	 * @returns {Component}
	 */
	getLeftPanel() {
		return this._leftPanel;
	}

	/**
	 * Sets the left panel.
	 * @param {function():Component} ComponentType
	 * @param {...object} options
	 */
	setLeftPanel(ComponentType, ...options) {
		if (this._leftPanel !== null) {
			this._leftPanel.destroy();
			this._leftPanel = null;
		}
		if (ComponentType !== null) {
			this._leftPanel = new ComponentType(this.elem.querySelector('#leftPanel'), ...options);
		}
	}

	/**
	 * Gets the main panel.
	 * @returns {Component}
	 */
	getMainPanel() {
		return this._mainPanel;
	}

	/**
	 * Sets the main panel.
	 * @param {function():Component} ComponentType
	 * @param {...object} options
	 */
	setMainPanel(ComponentType, ...options) {
		if (this._mainPanel !== null) {
			this._mainPanel.destroy();
			this._mainPanel = null;
		}
		if (ComponentType !== null) {
			this._mainPanel = new ComponentType(this.elem.querySelector('#mainPanel'), ...options);
		}
	}

	/**
	 * Gets the right panel.
	 * @returns {Component}
	 */
	getRightPanel() {
		return this._rightPanel;
	}

	/**
	 * Sets the right panel.
	 * @param {function():Component} ComponentType
	 * @param {...object} options
	 */
	setRightPanel(ComponentType, ...options) {
		if (this._rightPanel !== null) {
			this._rightPanel.destroy();
			this._rightPanel = null;
		}
		if (ComponentType !== null) {
			this._rightPanel = new ComponentType(this.elem.querySelector('#rightPanel'), ...options);
		}
	}

	/**
	 * Gets the right panel.
	 * @returns {Component}
	 */
	getFooter() {
		return this._footer;
	}

	/**
	 * Sets the right panel.
	 * @param {function():Component} ComponentType
	 * @param {...object} options
	 */
	setFooter(ComponentType, ...options) {
		if (this._footer !== null) {
			this._footer.destroy();
			this._footer = null;
		}
		if (ComponentType !== null) {
			this._footer = new ComponentType(this.elem.querySelector('#footer'), ...options);
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
