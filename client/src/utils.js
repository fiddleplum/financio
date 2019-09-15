export default class Utils {
	static fadeIn(element, duration) {
		if (element.style.display === 'none') {
			return new Promise((resolve, reject) => {
				element.style.opacity = '0';
				element.style.removeProperty('display');
				element.setAttribute('showing', '');
				const timer = setInterval((elem) => {
					let u = Number.parseFloat(elem.style.opacity);
					u += 1.0 / (duration * this.FPS);
					u = Math.min(u, 1.0);
					elem.style.opacity = '' + u;
					if (u >= 1.0) {
						clearInterval(timer);
						elem.removeAttribute('showing');
						resolve();
					}
				}, 1000.0 / this.FPS, element);
			});
		}
		else {
			element.style.removeProperty('opacity');
			return Promise.resolve();
		}
	}

	static fadeOut(element, duration) {
		if (element.style.display !== 'none') {
			return new Promise((resolve, reject) => {
				element.style.opacity = '1';
				element.setAttribute('hiding', '');
				const timer = setInterval((elem) => {
					let u = Number.parseFloat(elem.style.opacity);
					u -= 1.0 / (duration * this.FPS);
					u = Math.max(u, 0.0);
					elem.style.opacity = '' + u;
					if (u <= 0.0) {
						elem.style.display = 'none';
						clearInterval(timer);
						elem.removeAttribute('hiding');
						resolve();
					}
				}, 1000.0 / this.FPS, element);
			});
		}
	}
}

Utils.FPS = 30.0;
