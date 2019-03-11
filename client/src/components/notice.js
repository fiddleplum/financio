import { Component } from '@fiddleplum/app-js';

class Notice extends Component {
	constructor(elem, message) {
		super(elem);
		this.__style = `
			#notice {
				height: 100%;
				text-align: center;
			}
			`;
		this.__html = `
			<div id="notice" class="vertical-align">` + message + `</div>
			`;
	}

	showMessage(message) {
		this.__query('#notice').innerHTML = message;
	}
}

export default Notice;
