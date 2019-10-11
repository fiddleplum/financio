import React from 'react';
import './menu.css';
/** @typedef {import('../../../../app-js/src/router').default} Router */

/**
 * @typedef Props
 * @property {Router} router
 */

/**
 * The menu.
 * @extends {React.Component<Props>}
 */
export default class Menu extends React.Component {
	/**
	 * Constructs the app.
	 * @param {Props} props
	 */
	constructor(props) {
		super(props);

		this.state = {
		};

		this.onClick = this.onClick.bind(this);
	}

	componentDidMount() {
	}

	render() {
		return <>
			<h1>Main Menu</h1>
			<button id="accounts" onClick={this.onClick}>Accounts</button>
			<button id="categories" onClick={this.onClick}>Categories</button>
			<button id="rules" onClick={this.onClick}>Rules</button>
			<button id="budgets" onClick={this.onClick}>Budgets</button>
			<button id="reports" onClick={this.onClick}>Reports</button>
			</>;
	}

	onClick(event) {
		this.props.router.push({
			page: event.target.id
		});
	}
}
