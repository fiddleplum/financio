import { Component, Font } from '../../../../app-js/src/index';
import css from './selection.css';

export default class Selection extends Component {
	constructor(elem, selectCallback, cancelCallback) {
		super(elem);

		this._selectCallback = selectCallback;

		this._cancelCallback = cancelCallback;

		this._selectedIndex = 0;

		this._scrollPosition = 0;

		this._scrollVelocity = 0;

		this._items = [];

		// this._interval = setInterval(() => {
		// 	// console.log(this._scrollPosition + ' ' + this._scrollVelocity);
		// 	this._scrollPosition += this._scrollVelocity / Selection.frameRate;
		// 	this._scrollPosition = Math.max(0.0, Math.min(this._items.length, this._scrollPosition));
		// 	// if (this._scrollVelocity > 0) {
		// 	// 	this._scrollVelocity = Math.max(0, this._scrollVelocity - 20 / Selection.frameRate);
		// 	// }
		// 	// else {
		// 	// 	this._scrollVelocity = Math.min(0, this._scrollVelocity + 20 / Selection.frameRate);
		// 	// }
		// 	this._scrollVelocity *= Math.pow(0.01, 1 / Selection.frameRate);
		// 	if (Math.abs(this._scrollVelocity) < 0.1) {
		// 		this._scrollVelocity = 0;
		// 	}
		// 	this.get('items').style.marginTop = (-1.5 * this._scrollPosition) + 'rem';
		// }, 1000 / Selection.frameRate);

		// window.addEventListener('touchmove', (event) => {
		// 	if (event.touches.length !== 1) {
		// 		return;
		// 	}
		// 	if (Math.abs(this._touchPosition - event.touches.item(0).screenY) > Font.convertRemToPixels(0.25)) {
		// 		this.
		// 	}
		// });
	}

	destroy() {
		// clearInterval(this._interval);
	}

	/**
	 * Sets the items to choose from.
	 * @param {string[]}
	 */
	set items(items) {
		let html = '';
		this._items = [];
		for (let i = 0; i < items.length; i++) {
			this._items.push(items[i]);
			html += `<div id="item${i}" onclick="_selectItem">${items[i]}</div>`;
		}
		this.setHtml('items', html);
	}

	/**
	 * @param {MouseEvent} event
	 */
	_selectItem(event) {
		this._selectedIndex = parseInt(event.target.id.substr(4));
		if (this._selectCallback) {
			this._selectCallback(this._selectedIndex, this._items[this._selectedIndex]);
		}
	}

	// /**
	//  * @param {WheelEvent} event
	//  * @private
	//  */
	// _onWheel(event) {
	// 	console.log('wheel');
	// 	this._scrollVelocity += 2.0 * Math.sign(event.deltaY);
	// 	event.preventDefault();
	// }

	// /**
	//  * @param {TouchEvent} event
	//  * @private
	//  */
	// _onTouchStart(event) {
	// 	if (event.touches.length !== 1) {
	// 		return;
	// 	}
	// 	this._touchPosition = event.touches.item(0).screenY;
	// }
}

Selection.frameRate = 30;

Selection.html = `
	<div id="items" o2nwheel="_onWheel" o2ntouchstart="_onTouchStart" style="margin-top: 0;"></div>
	`;

Selection.css = css;

Selection.register();
