import { SimpleApp } from '../../../../app-ts/src/index';

/** The menu page. */
export default class Menu extends SimpleApp.Page {
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

Menu.html = `
	<h1>Main Menu</h1>
	<button ref="listAccounts" onclick="goToPage">Accounts</button>
	<button ref="listCategories" onclick="goToPage">Categories</button>
	<button ref="rules" onclick="goToPage">Rules</button>
	<button ref="budgets" onclick="goToPage">Budgets</button>
	<button ref="reports" onclick="goToPage">Reports</button>
	`;

Menu.css = `
	button.Menu {
		display: block;
		margin: 1rem auto;
		width: 10rem;
	}
	`;

Menu.register();
