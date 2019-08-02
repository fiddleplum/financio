import React from 'react';
import './app.css';

import Menu from './components/menu';

/**
 * @typedef Props
 */

/**
 * The root class of the app.
 */
export default class App extends React.Component {
	/**
	 * Constructs the app.
	 * @param {Props} props
	 */
	constructor(props) {
		super(props);

		this.state = {
			ready: false,
			title: 'FINANCIO',
			page: 'menu'
		};

		this._pages = {
			menu: Menu
		};
	}

	componentDidMount() {
	}

	render() {
		const Page = this._pages[this.state.page];

		return <>
			<div id="title">{this.state.title}</div>
			<div id="page" className={Page.name}><Page /></div>
			</>;
	}
}
