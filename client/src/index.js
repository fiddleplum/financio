import Financio from './financio';

document.addEventListener('DOMContentLoaded', () => {
	/**
	 * @type {Financio}
	 * @global
	 */
	try {
		let financio = new Financio();
		financio.initialize();
	}
	catch (e) {
	}
});
