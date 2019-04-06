import { Component } from '../../../../app-js/src/index'

class MainMenu extends Component {
	constructor(elem) {
		super(elem);
		this.__html = `
			<div class="page_title">Main Menu</div>
			<div class="button" onclick="window.app.router.pushRoute('accounts');">Accounts</div>
			<div class="button" onclick="window.app.router.pushRoute('categories');">Categories</div>
			<div class="button" onclick="window.app.router.pushRoute('rules');">Rules</div>
			<div class="button" onclick="window.app.router.pushRoute('budget');">Budget</div>
			<div class="button" onclick="window.app.router.pushRoute('reports');">Reports</div>
			`;
	}
}

export default MainMenu;
