import { Component, ShowHide } from '../../../../app-js/src/index';

class Notice extends Component {
	constructor(elem) {
		super(elem);

		this._message = '';
	}

	async showMessage(message) {
		this.__html = message;

		this.__addStyleClass('visible');
	}

	clearMessage() {
		this.__removeStyleClass('visible');
	}
}

Notice.__style =  `
	.Notice {
		opacity: 0;
		text-align: center;
		pointer-events: none;
	}

	.Notice.visible {
		opacity: 1;
	}
	`;

export default Notice;
