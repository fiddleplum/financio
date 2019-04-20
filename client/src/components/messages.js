import { Component } from '../../../../app-js/src/index';

export default class Messages extends Component {
	/**
	 * Constructs a component at the location of the grid-area.
	 * @param {HTMLElement} elem
	 */
	constructor(elem) {
		super(elem);

		/**
		 * The number of messages visible at once.
		 * @type {number}
		 * @private
		 */
		this._numVisibleMessages = 1;

		/**
		 * The current list of messages displayed or in the queue.
		 * @type {string[]}
		 * @private
		 */
		this._messages = [];

		/**
		 * The this-bound animation end event listener.
		 * @type {function(AnimationEvent):void}
		 * @private
		 */
		this._animationEndEventListenerBound = Messages._animationEndEventListener.bind(this);

		// Add the animation end event listener.
		this.elem.addEventListener('animationend', this._animationEndEventListenerBound);
	}

	destroy() {
		this.elem.removeEventListener(this._animationEndEventListenerBound);
	}

	/**
	 * Returns the number of messages visible at once.
	 * @returns {number}
	 */
	get numVisibleMessages() {
		return this._numVisibleMessages;
	}

	/**
	 * Sets the number of messages visible at once.
	 * @param {number} numVisibleMessages
	 */
	set numVisibleMessages(numVisibleMessages) {
		this._numVisibleMessages = numVisibleMessages;
		this._div.style.height = (this._numVisibleMessages * 2) + 'em';
		this._pruneEndMessages();
	}

	/**
	 * Adds a new message.
	 * @param {string} message
	 */
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
		this._div.innerHTML = html;
	}

	/**
	 * Removes the messages no longer in the message queue.
	 * @private
	 */
	_pruneEndMessages() {
		while (this._messages.length > this._numVisibleMessages + 1) {
			this._messages.pop();
			this._div.removeChild(this._div.lastChild);
		}
	}

	/**
	 * The animation end event listener.
	 * @param {AnimationEvent} event
	 * @private
	 */
	_animationEndEventListener(event) {
		this._pruneEndMessages();
		this._div.children[0].classList.remove('invisible');
		if (this._div.children.length > 1) {
			this._div.children[1].classList.remove('movingdown');
		}
	}
}

Messages.style = `
	.Messages {
		background: var(--bg-dark);
		color: var(--fg-dark);
		overflow-y: hidden;
	}

	.Messages p {
		margin: 0;
		padding-left: .5em;
		line-height: 2em;
	}

	@keyframes movedown {
		from {
			margin-top: 0;
		}
		to {
			margin-top: 2.0em;
		}
	}

	.Messages .movingdown {
		animation-duration: .25s;
		animation-name: movedown;
	}

	.Messages .invisible {
		display: none;
	}
	`;

Messages.html = `
	<div></div>
	`;
