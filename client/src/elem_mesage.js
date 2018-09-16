class ElemMessage extends HTMLElement {
	constructor() {
		super();

		this._numVisibleMessages = 1;

		this._messages = [];

		this._shadowRoot = this.attachShadow({mode: 'open'});

		this._shadowRoot.innerHTML = `
			<style>
			* {
				margin: 0;
			}

			#root {
				overflow-y: hidden;
				background: grey;
			}

			p {
				padding: .25em;
				line-height: 1.5em;
			}

			@keyframes movedown {
				from {
					margin-top: 0;
				}
				to {
					margin-top: 2.0em;
				}
			}

			.movingdown {
				animation-duration: .25s;
				animation-name: movedown;
			}

			.invisible {
				display: none;
			}

			</style>
			<div id="root">
			</div>`;

		this._root = this._shadowRoot.querySelector('#root');
		this._root.addEventListener('animationend', (event) => {
			this._pruneEndMessages();
			this._root.children[0].classList.remove('invisible');
			if (this._root.children.length > 1) {
				this._root.children[1].classList.remove('movingdown');
			}
		});
		this._root.style.height = (this._numVisibleMessages * 2) + 'em';
	}

	get numVisibleMessages() {
		return this._numVisibleMessages;
	}

	set numVisibleMessages(numVisibleMessages) {
		this._numVisibleMessages = numVisibleMessages;
		this._root.style.height = (this._numVisibleMessages * 2) + 'em';
		this._pruneEndMessages();
	}

	addMessage(message) {
		this._messages.unshift(message);
		this._pruneEndMessages();
		let html = ``;
		if (this._messages.length > 1) {
			html += `<p class='invisible'>` + this._messages[0] + `</p>`;
			html += `<p class='movingdown'>` + this._messages[1] + `</p>`;
			for (let i = 2, l = this._messages.length; i < l; i++) {
				html += `<p>` + this._messages[i] + `</p>`;
			}
		}
		else {
			html += `<p>` + this._messages[0] + `</p>`;
		}
		this._root.innerHTML = html;
	}

	_pruneEndMessages() {
		while (this._messages.length > this._numVisibleMessages + 1) {
			this._messages.pop();
			this._root.removeChild(this._root.lastChild);
		}
	}
}

window.customElements.define('elem-message', ElemMessage);

export default ElemMessage;
