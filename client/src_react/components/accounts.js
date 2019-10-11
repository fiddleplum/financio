import React from 'react';
import './accounts.css';
/** @typedef {import('../../../../app-js/src/router').default} Router */
/** @typedef {import('../../../../app-js/src/ws').default} WS */

/**
 * @typedef Props
 * @property {Router} router
 * @property {WS} server
 */

/**
 * The accounts page.
 * @extends {React.Component<Props>}
 */
export default class Accounts extends React.Component {
	/**
	 * Constructs the app.
	 * @param {Props} props
	 */
	constructor(props) {
		super(props);

		this.state = {
			/**
			 * The list of account names.
			 * @type {string[]}
			 * @private
			 */
			accountNames: []
		};

		this.goToViewAccount = this.goToViewAccount.bind(this);

		this.goToAddAccount = this.goToAddAccount.bind(this);
	}

	async componentDidMount() {
		/** @type string[]} */
		const accountNames = await this.props.server.send({
			command: 'list accounts'
		});
		this.setState({
			accountNames: accountNames
		});
	}

	render() {
		return <>
			<h1>Accounts</h1>
			<div className="list">
				{this.state.accountNames.map((name) => {
					return <button key={name} onClick={this.goToViewAccount}>{name}</button>;
				})}
			</div>
			<button onClick={this.goToAddAccount}>+ New Account +</button>
			</>;
	}

	goToViewAccount(event) {
		this.props.router.push({
			page: 'viewAccount',
			name: event.target.innerHTML
		});
	}

	goToAddAccount(event) {
		this.props.router.push({
			page: 'addAccount'
		});
	}
}
