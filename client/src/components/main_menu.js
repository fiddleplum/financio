import Component from '../component';

class MainMenu extends Component {
	constructor(gridArea) {
		super(gridArea);
		this.__div.innerHTML = `
			<div class="page_title">Main Menu</div>
			<div class="button" onclick="window.app.showPage('accounts');">Accounts</div>
			<div class="button">Categories</div>
			<div class="button">Rules</div>
			<div class="button">Budget</div>
			<div class="button">Reports</div>
			`;
	}
}

export default MainMenu;
