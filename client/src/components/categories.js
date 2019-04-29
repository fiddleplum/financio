import { UIComponent } from '../../../../app-js/src/index';

export default class Categories extends UIComponent {
	/**
	 * Constructor.
	 * @param {HTMLElement} elem
	 */
	constructor(elem) {
		super(elem);
		this.refresh();
	}

	async refresh() {
		/** @type string[]} */
		let categories = await window.app.ws.send({
			'command': 'get categories'
		});

		let html = ``;
		for (let category of categories) {
			html += `<div>` + category + `</div>`;
		}
		this.elem.querySelector('#list').innerHTML = html;
	}
}

Categories.html = `
	<h1>Categories</h1>
	<div id="list"></div>
	<div class="toolbar"><!--
		--><button>+</button><!--
		--><button>→</button><!--
		--><button>←</button><!--
		--><button>↑</button><!--
		--><button>↓</button><!--
		--></div>
	`;

Categories.style = `
	.Categories #list {
		height: calc(100% - 4em - 1px);
	}
	.Categories #toolbar {
		height: calc(2em + 1px);
	}
	`;

