import { Component } from '../../../../app-ts/src/index';

/** A toggle switch. */
export class ToggleSwitch extends Component {
	/** The current state. */
	private _on: boolean = false;

	constructor(params: Component.Params) {
		super(params);

		const name = params.attributes.get('name');
		if (typeof name === 'string') {
			this.__element('input').setAttribute('name', name);
		}

		const bg = params.attributes.get('bg');
		if (typeof bg === 'string') {
			(this.root as HTMLElement).style.background = bg;
		}

		const fg = params.attributes.get('fg');
		if (typeof fg === 'string') {
			(this.__element('handle') as HTMLElement).style.background = fg;
		}

		const height = params.attributes.get('height');
		if (typeof height === 'string') {
			(this.root as HTMLElement).style.fontSize = height;
		}
	}

	onClick() {
		if (this._on) {
		}
		else {

		}
	}
}

ToggleSwitch.html = /*html*/`
	<span ref="switch" onclick="{{onClick}}">
		<input ref="input" name="" type="input" />
		<span ref="on text"></span>
		<span ref="handle"></span>
		<span ref="off text"></span>
	</span>
	`;

ToggleSwitch.css = /*css*/`
	.ToggleSwitch {
		display: inline-block;
		width: 5em;
		height: 1em;
		border-radius: .5em;
	}
	.ToggleSwitch input {
		display: none;
	}
	.ToggleSwitch span[ref="handle"] {
		display: inline-block;
		width: 1em;
		height: 1em;
		border-radius: .5em;
	}
	.ToggleSwitch span[ref="on text"] {
		background: 
		border-radius: 
	}
	`;

ToggleSwitch.register();
