import { Component } from '../../../../app-js/src/index';

export default class SelectionList extends Component {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 */
	constructor(elem) {
		super(elem);

		/**
		 * The list of items.
		 * @type {string[]}
		 * @private
		 */
		this._items = [];

		/**
		 * The selected item's index.
		 * @type {number}
		 * @private
		 */
		this._selectedIndex = 4;

		/**
		 * The callback called when an item is selected.
		 * @type {(index: number, item: string) => void}
		 * @private
		 */
		this._selectedCallback = undefined;
	}

	itemAtIndex(index) {
		return this._items[index];
	}

	addItem(item) {
		const index = this._items.length;
		this._items.push(item);
		const itemDiv = document.createElement('div');
		itemDiv.innerHTML = item;
		itemDiv.addEventListener('click', () => {
			if (this._selectedCallback) {
				this._selectedCallback(index, this._items[index]);
			}
		});
		if (index === this._selectedIndex) {
			itemDiv.classList.add('selected');
			if (this._selectedCallback) {
				this._selectedCallback(index, this._items[index]);
			}
		}
	}

	removeItem(index) {
		if (index === this._selectedIndex) {
			this._selectedIndex = undefined;
			if (this._selectedCallback) {
				this._selectedCallback(undefined, undefined);
			}
		}
		this._items.splice(index);
		this.elem.removeChild(this.elem.children[index]);
	}

	get selectedIndex() {
		return this._selectedIndex;
	}

	set selectedIndex(index) {
		if (this._selectedIndex !== index) {
			if (0 <= this._selectedIndex && this._selectedIndex < this._items.length) {
				this.elem.children[this._selected].classList.remove('selected');
			}
			this._selectedIndex = index;
			if (0 <= this._selectedIndex && this._selectedIndex < this._items.length) {
				this.elem.children[this._selected].classList.add('selected');
			}
			if (this._selectedCallback) {
				this._selectedCallback(index, this._items[index]);
			}
		}
	}

	/**
	 * Set the selected callback.
	 * @param {(index: number, item: string) => void} selectedCallback
	 */
	set selectedCallback(selectedCallback) {
		this._selectedCallback = selectedCallback;
	}
}

SelectionList.html = `
`;

SelectionList.style = `
	`;
