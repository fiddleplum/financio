import Financio from './financio';

document.addEventListener('DOMContentLoaded', async () => {
	/**
	 * @type {Financio}
	 * @global
	 */
	let financio = new Financio();
	await financio.initialize();
});
