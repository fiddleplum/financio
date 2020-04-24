import { Financio } from '../internal';

/** The menu page. */
export class Menu extends Financio.Page {
	/** The click event handler for the menu buttons. */
	private goToPage(event: UIEvent): void {
		if (event.target instanceof Element) {
			const ref = event.target.getAttribute('ref');
			if (ref !== null) {
				this.app.router.pushQuery({
					page: ref
				});
			}
		}
	}
}

Menu.html = /*html*/`
	<div>
		<h1>Main Menu</h1>
		<h2><a href='javascript:' ref="listAccounts" onclick="{{goToPage}}">Accounts</a></h2>
		<h2><a href='javascript:' ref="listCategories" onclick="{{goToPage}}">Categories</a></h2>
		<h2><a href='javascript:' ref="listFunds" onclick="{{goToPage}}">Funds</a></h2>
		<h2><a href='javascript:' ref="rules" onclick="{{goToPage}}">Rules</a></h2>
		<h2><a href='javascript:' ref="budgets" onclick="{{goToPage}}">Budgets</a></h2>
		<h2><a href='javascript:' ref="reports" onclick="{{goToPage}}">Reports</a></h2>
	</div>
	`;

Menu.css = /*css*/`
	.Menu button {
		display: block;
		margin: 1rem auto;
		width: 10rem;
	}
	`;

Menu.register();
