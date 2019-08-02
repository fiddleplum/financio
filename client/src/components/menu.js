import React from 'react';
import './menu.css';

/**
 * @typedef Props
 */

/**
 * The menu.
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
	}

	componentDidMount() {
	}

	render() {
		return <>
			<h1>Main Menu</h1>
			<div id="accounts" className="button">Accounts</div>
			<div id="categories" className="button">Categories</div>
			<div id="rules" className="button">Rules</div>
			<div id="budgets" className="button">Budgets</div>
			<div id="reports" className="button">Reports</div>
			</>;
	}
}
