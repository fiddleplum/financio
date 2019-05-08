import { UIComponent } from '../../../../app-js/src/index';

export default class MainMenu extends UIComponent {
}

MainMenu.html = `
	<h1>Main Menu</h1>
	<div class="menu">
		<a href="javascript:;" onclick="window.app.router.pushRoute('accounts/list');">Accounts</a>
		<a href="javascript:;" onclick="window.app.router.pushRoute('categories/view');">Categories</a>
		<a href="javascript:;" onclick="window.app.router.pushRoute('rules/view');">Rules</a>
		<a href="javascript:;" onclick="window.app.router.pushRoute('budget/view');">Budget</a>
		<a href="javascript:;" onclick="window.app.router.pushRoute('reports/list');">Reports</a>
	</div>
	`;

MainMenu.style = `
	.MainMenu a {
		display:block;
		margin: 1em 0;
		text-align: center;
		text-decoration: none;
		color: var(--fg-light);
	}
	`;
