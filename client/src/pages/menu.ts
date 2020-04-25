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
		<h2><button ref="listAccounts" onclick="{{goToPage}}">Accounts</button></h2>
		<h2><button ref="listCategories" onclick="{{goToPage}}">Categories</button></h2>
		<h2><button ref="listFunds" onclick="{{goToPage}}">Funds</button></h2>
		<h2><button ref="rules" onclick="{{goToPage}}">Rules</button></h2>
		<h2><button ref="budgets" onclick="{{goToPage}}">Budgets</button></h2>
		<h2><button ref="reports" onclick="{{goToPage}}">Reports</button></h2>
	</div>
	`;

Menu.css = /*css*/`
	`;

Menu.register();
