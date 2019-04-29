import { UIComponent } from '../../../../app-js/src/index';

export default class MainMenu extends UIComponent {
}

MainMenu.html = `
	<h1>Main Menu</h1>
	<div class="menu">
		<button onclick="window.app.router.pushRoute('accounts/list');">Accounts</button>
		<button onclick="window.app.router.pushRoute('categories/view');">Categories</button>
		<button onclick="window.app.router.pushRoute('rules/view');">Rules</button>
		<button onclick="window.app.router.pushRoute('budget/view');">Budget</button>
		<button onclick="window.app.router.pushRoute('reports/list');">Reports</button>
	</div>
	`;
