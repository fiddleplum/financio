import { Component } from '../../../../app-ts/src/index';

/** A generic form. */
export class NiceForm extends Component {
	/** The onCancel callback. */
	public onCancel: CancelFunction | undefined;

	/** The onSubmit callback. */
	public onSubmit: SubmitFunction | undefined;

	constructor(params: Component.Params) {
		super(params);

		// Process the entries attribute.
		const entries = params.attributes.get('entries');
		if (entries !== undefined) {
			if (!(entries instanceof Array)) {
				throw new Error('Attribute "entries" must be an array.');
			}
			this.entries = entries;
		}

		// Process the submit button text.
		const submitText = params.attributes.get('submittext');
		if (typeof submitText === 'string') {
			this.__element('submit').innerHTML = submitText;
		}

		// Process the cancel callback.
		const onCancel = params.attributes.get('oncancel');
		if (onCancel instanceof Function) {
			this.onCancel = onCancel as () => {};
		}

		// Process the submit callback.
		const onSubmit = params.attributes.get('onsubmit');
		if (onSubmit instanceof Function) {
			this.onSubmit = onSubmit as SubmitFunction;
		}
	}

	set entries(entries: NiceForm.Entry[]) {
		let html = ``;
		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i];
			if (!(entry instanceof NiceForm.Entry)) {
				throw new Error('Element ' + i + ' of attribute "entries" must be a Form.Entry.');
			}
			html += /*html*/`
				<div class="input">
					<label for="${entry.name}">${entry.label}:</label>`;
			if (entry.type === 'text') {
				html += /*html*/`
					<input name="${entry.name}" id="${entry.name}" type="text" />`;
			}
			else if (entry.type === 'password') {
				html += /*html*/`
					<input name="${entry.name}" id="${entry.name}" type="password" />`;
			}
			else if (entry.type === 'choice') {
				if (!(entry.options instanceof Array)) {
					throw new Error('Element ' + i + ' of attribute "entries" must have options as a choice type.');
				}
				html += /*html*/`
					<select name="${entry.name}" id="${entry.name}">`;
				for (const option of entry.options) {
					html += /*html*/`
						<option value="${option.value}">${option.label}</option>`;
				}
				html += /*html*/`
					</select>`;
			}
			html += /*html*/`
				</div>`;
		}
		this.__setHtml(this.__element('inputs'), this, html);
	}

	/** Gets the inputs from a form along with their values. Each key/value pair is an input's name and
	 * corresponding value. */
	private _getFormResults(elem: Element): NiceForm.Results {
		const results: NiceForm.Results = {};
		for (const child of elem.children) {
			if (child instanceof HTMLInputElement
				|| child instanceof HTMLSelectElement
				|| child instanceof HTMLTextAreaElement) {
				const name = child.getAttribute('name');
				if (name !== null) {
					if (child instanceof HTMLInputElement && child.getAttribute('type') === 'checkbox') {
						results[name] = child.checked;
					}
					else {
						results[name] = child.value;
					}
				}
			}
			Object.assign(results, this._getFormResults(child));
		}
		return results;
	}

	private _cancel() {
		if (this.onCancel) {
			this.onCancel();
		}
	}

	private _submit() {
		if (this.onSubmit) {
			const result = this._getFormResults(this.root);
			this.onSubmit(result).then((feedback: string) => {
				if (feedback.length > 0) {
					const feedbackElem = this.__element('feedback');
					feedbackElem.innerHTML = feedback;
					feedbackElem.style.opacity = '1';
				}
				else {
					const feedbackElem = this.__element('feedback');
					feedbackElem.style.opacity = '0';
				}
			});
		}
	}
}

export namespace NiceForm {
	export class Option {
		public value: string = '';
		public label: string = '';
		constructor(value: string, label: string) {
			this.value = value;
			this.label = label;
		}
	}
	export class Entry {
		public name: string = '';
		public label: string = '';
		public type: 'text' | 'password' | 'choice' = 'text';
		public options: Option[] = [];
		public tooltip: string = '';
		constructor(name: string, label: string, type: 'text' | 'password' | 'choice', options?: Option[], tooltip?: string) {
			this.name = name;
			this.label = label;
			this.type = type;
			if (options !== undefined) {
				for (const option of options) {
					this.options.push(new Option(option.value, option.label));
				}
			}
			if (tooltip !== undefined) {
				this.tooltip = tooltip;
			}
		}
	}
	export type Results = {[key: string]: string | boolean};
}

NiceForm.html = /*html*/`
	<form action="javascript:">
		<div ref="inputs">
		</div>
		<div ref="buttons">
			<button class="left" onclick="{{_cancel}}">Cancel</button>
			<button ref="submit" class="right" onclick="{{_submit}}">Submit</button>
		</div>
		<div ref="feedback"></div>
	</form>
	`;

NiceForm.css = /*css*/`
	.Form input[type="text"], .Form input[type="password"] {
		max-width: 10rem;
	}

	.NiceForm .circled {
		display: inline-block;
		width: calc(1.66em - 1px);
		height: calc(1.66em - 1px);
		border: 1px solid var(--fg-light);
		border-radius: 1em;
		font-size: .75em;
		text-align: center;
	}

	.NiceForm [ref="feedback"] {
		opacity: 0;
		transition: opacity .25s;
	}

	.NiceForm {
		overflow: auto;
	}
	
	.NiceForm .input {
		display: inline-block;
		margin: 0 1rem 1rem 0;
	}
	
	.NiceForm label {
		display: block;
		margin-bottom: 0.25rem;
	}
	
	.NiceForm [ref=buttons] {
		overflow: auto;
		margin: 0 0 1rem 0;
	}
	
	.NiceForm .left {
		float: left;
	}
	
	.NiceForm .right {
		float: right;
		text-align: right;
	}
	
	@media (max-width: 40rem) {
		.NiceForm .inputs {
			grid-template-columns: 1fr;
			grid-auto-rows: 1rem minmax(2rem, max-content);
		}
		.NiceForm .inputs .left {
			display: block;
			text-align: left;
			margin-right: 0;
			width: 100%;
			margin-bottom: .25rem;
		}
		.NiceForm .inputs .right {
			display: block;
			text-align: left;
			margin-left: 0;
			width: 100%;
		}
	}
	
	@media (max-width: 24rem) {
		.NiceForm .buttons .cancel {
			width: 100%;
		}
	
		.NiceForm .buttons .submit {
			width: 100%;
			margin-bottom: 1rem;
		}
	}
	
	.NiceForm .feedback {
		margin-bottom: 1rem;
	}
	`;

type CancelFunction = () => {};
type SubmitFunction = (result: NiceForm.Results) => Promise<string>;

NiceForm.register();
