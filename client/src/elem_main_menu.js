class ElemMainMenu extends HTMLElement {
	connectedCallback() {
		this.innerHTML = `
			<div class="page_title">Main Menu</div>
			<div class="button" onclick="app.showPage('elem-account-list');">Accounts</div>
			<div class="button">Categories</div>
			<div class="button">Rules</div>
			<div class="button">Budget</div>
			<div class="button">Reports</div>
			`;
	}
}

window.customElements.define('elem-main-menu', ElemMainMenu);

export default ElemMainMenu;
