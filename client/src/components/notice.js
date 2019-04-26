import { UIComponent } from '../../../../app-js/src/index';

export default class Notice extends UIComponent {
	constructor(elem) {
		super(elem);

		this._message = '';
	}

	async showMessage(message) {
		this.elem.innerHTML = message;

		this.__addStyleClass('visible');
	}

	clearMessage() {
		this.__removeStyleClass('visible');
	}
}

Notice.style = `
	.Notice {
		opacity: 0;
		text-align: center;
		pointer-events: none;
	}

	.Notice.visible {
		opacity: 1;
	}
	`;
