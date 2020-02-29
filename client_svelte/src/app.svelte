<div id="title"><a href="/">Financio!</a></div>
<div id="page"><svelte:component this={page}/></div>

<style>
	#title {
		background: var(--bg-dark);
		padding-left: .5rem;
		color: var(--fg-dark);
		font-size: 2rem;
		line-height: 1.5em;
	}
	#page {
		padding-left: .5rem;
	}
</style>

<script>
	import { getContext, setContext } from 'svelte';
	import Router from '../../../app-js/src/router.js';

	// Setup the pages.
	import MainMenu from './main_menu.svelte';
	const pages = {
		'main_menu': MainMenu
	};
	let page = null;

	// Setup the router.
	const router = new Router();
	router.addCallback((query) => {
		console.log(query);
		const newPage = query['page'];
		if (newPage !== '' && newPage !== undefined) {
			if (newPage in pages) {
				page = pages[query['page']];
			}
			else {
				page = pages['main_menu'];
			}
		}
		else {
			page = pages['main_menu'];
		}
	});
	router.processURL();
	setContext('router', new Router());
</script>

