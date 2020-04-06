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

Menu.html = `
	<div>
		<h1>Main Menu</h1>
		<button ref="listAccounts" onclick="goToPage">Accounts</button>
		<button ref="listCategories" onclick="goToPage">Categories</button>
		<button ref="rules" onclick="goToPage">Rules</button>
		<button ref="budgets" onclick="goToPage">Budgets</button>
		<button ref="reports" onclick="goToPage">Reports</button>
	</div>
	`;

Menu.css = `
	.Menu button {
		display: block;
		margin: 1rem auto;
		width: 10rem;
	}
	`;

Menu.register();
