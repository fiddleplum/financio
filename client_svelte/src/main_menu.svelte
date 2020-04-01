<h1>Main Menu</h1>
<button id="accounts" on:click={goToPage}>Accounts</button>
<button id="categories" on:click={goToPage}>Categories</button>
<button id="rules" on:click={goToPage}>Rules</button>
<button id="budgets" on:click={goToPage}>Budgets</button>
<button id="reports" on:click={goToPage}>Reports</button>

<style>
button {
	display: block;
	margin: 1rem auto;
	width: 10rem;
}
</style>

<script>
import A from './a';

/** @type {A} */
const a = null;

const b = new A();

/** @type {Router} */
export let router;

/** @type {Router} */
const a = null;

// import { getContext } from 'svelte';
// const router = getContext('router');

function goToPage(event) {
	console.log(event);
	console.log('here');
	router.pushQuery({
		'page': event.target.id
	});
}
</script>
