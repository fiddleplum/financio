import { Component } from '../../../../app-ts/src/index';

/** A generic form. */
export class NiceForm extends Component {
	/** The onCancel callback. */
	public onCancel: CancelFunction | undefined;

	/** The onSubmit callback. */
	public onSubmit: SubmitFunction | undefined;

	constructor(params: Component.Params) {
		super(params);

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

		// Process the children.
		for (const child of params.children) {
			if (child instanceof Element && child.tagName === 'ENTRY') {
				const name = child.getAttribute('name');
				const type = child.getAttribute('type') || 'text';
				const tooltip = child.getAttribute('tooltip') || '';
				const options: NiceForm.Option[] = [];
				if (type === 'choice') {
					const grandchildrenToRemove: Element[] = [];
					for (const grandchild of child.childNodes) {
						if (grandchild instanceof Element && grandchild.tagName === 'OPTION') {
							const value = grandchild.getAttribute('value') || '';
							const label = grandchild.innerHTML;
							const option = new NiceForm.Option(value, label);
							options.push(option);
							grandchildrenToRemove.push(grandchild);
						}
					}
					for (const element of grandchildrenToRemove) {
						child.removeChild(element);
					}
				}
				const label = child.innerHTML;
				if (name !== null && name !== '') {
					this.insertEntry(name, label, type, options, tooltip);
				}
			}
		}
	}

	/** Inserts an entry into a form. */
	insertEntry(name: string, label: string, type: string, options?: NiceForm.Option[], tooltip?: string, beforeName?: string) {
		let html = /*html*/`
			<div class="entry" ref="${name}">
				<label for="${name}">${label}:</label>`;
		if (type === 'text') {
			html += /*html*/`
				<input name="${name}" id="${name}" type="text" />`;
		}
		else if (type === 'password') {
			html += /*html*/`
				<input name="${name}" id="${name}" type="password" />`;
		}
		else if (type === 'choice') {
			html += /*html*/`
				<select name="${name}" id="${name}">`;
			if (options instanceof Array) {
				for (const option of options) {
					html += /*html*/`
						<option value="${option.value}">${option.label}</option>`;
				}
			}
			html += /*html*/`
				</select>`;
		}
		html += /*html*/`
			</div>`;
		let beforeElem = null;
		if (beforeName !== undefined) {
			beforeElem = this.__element(beforeName);
		}
		this.__insertHtml(this.__element('inputs'), beforeElem, this, html);
	}

	/** Remove an entry from the form. */
	removeEntry(name: string) {
		const element = this.__element(name);
		this.__removeElement(element);
	}

	/** Inserts an option into a choice. */
	insertOption(choiceName: string, value: string, label: string, before?: number) {
		const selectElement = this.__element(choiceName).children[1];
		const beforeElement = before !== undefined ? selectElement.children[before] : null;
		const html = /*html*/`<option value="${value}">${label}</option>`;
		this.__insertHtml(selectElement, beforeElement, this, html);
	}

	/** Removes an option from a choice. */
	removeOption(choiceName: string, option: number) {
		const selectElement = this.__element(choiceName).children[1];
		const optionElement = selectElement.children[option];
		this.__removeElement(optionElement);
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
	
	.NiceForm .entry {
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
