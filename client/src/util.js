class Util {
	/**
	 * Shows an element in an animated way. The element must be a block display style.
	 * @param {HTMLElement} elem
	 * @param {number} duration
	 */
	static async showElement(elem, duration = 0.125) {
		const fps = 30.0;
		if (elem.style.display !== 'block') {
			elem.style.opacity = '0';
			elem.style.display = 'block';
			elem.setAttribute('showing', '1');
			return new Promise((resolve, reject) => {
				const timer = setInterval((elem) => {
					let u = Number.parseFloat(elem.style.opacity);
					u += 1.0 / (duration * fps);
					u = Math.min(u, 1.0);
					elem.style.opacity = '' + u;
					if (u >= 1.0) {
						clearInterval(timer);
						elem.removeAttribute('showing');
						resolve();
					}
				}, 1000.0 / fps, elem);
			});
		}
		else {
			return Promise.resolve();
		}
	}

	/**
	 * Hides an element in an animated way. The element must be a block display style.
	 * @param {HTMLElement} elem
	 * @param {number} duration
	 */
	static async hideElement(elem, duration = 0.125) {
		const fps = 30.0;
		if (elem.style.display !== 'none') {
			elem.style.opacity = '1';
			elem.setAttribute('hiding', '1');
			return new Promise((resolve, reject) => {
				const timer = setInterval((elem) => {
					let u = Number.parseFloat(elem.style.opacity);
					u -= 1.0 / (duration * fps);
					u = Math.max(u, 0.0);
					elem.style.opacity = '' + u;
					if (u <= 0.0) {
						elem.style.display = 'none';
						clearInterval(timer);
						elem.removeAttribute('hiding');
						resolve();
					}
				}, 1000.0 / fps, elem);
			});
		}
		else {
			return Promise.resolve();
		}
	}

	/**
	 * Returns true if an element is shown or showing.
	 * @param {HTMLElement} elem
	 * @returns {boolean}
	 */
	static isElementShown(elem) {
		return getComputedStyle(elem, null).display !== 'none' && !elem.hasAttribute('hiding');
	}

	/**
	 * Returns true if an element is hidden or hiding.
	 * @param {HTMLElement} elem
	 * @returns {boolean}
	 */
	static isElementHidden(elem) {
		return getComputedStyle(elem, null).display === 'none' || elem.hasAttribute('hiding');
	}
}

export default Util;
