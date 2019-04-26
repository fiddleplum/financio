import { UIComponent } from '../../../../app-js/src/index';

export default class MainMenu extends UIComponent {
}

MainMenu.html = `
	<h1>Main Menu</h1>
	<div class="button" onclick="window.app.router.pushRoute('accounts/list');">Accounts</div>
	<div class="button" onclick="window.app.router.pushRoute('categories/view');">Categories</div>
	<div class="button" onclick="window.app.router.pushRoute('rules/view');">Rules</div>
	<div class="button" onclick="window.app.router.pushRoute('budget/view');">Budget</div>
	<div class="button" onclick="window.app.router.pushRoute('reports/list');">Reports</div>
	`;
