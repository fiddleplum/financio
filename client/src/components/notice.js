import { Component } from '@fiddleplum/app-js';

class Notice extends Component {
	constructor(gridArea) {
		super(gridArea);
		this.__style = `
			#notice {
				height: 100%;
				text-align: center;
			}
			`;
		this.__div.innerHTML = `
			<div id="notice" class="vertical-align"></div>
			`;
	}

	showMessage(message) {
		this.__div.querySelector('#notice').innerHTML = message;
	}
}

export default Notice;
