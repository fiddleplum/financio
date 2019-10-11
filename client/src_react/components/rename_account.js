import React from 'react';
import './rename_account.css';
/** @typedef {import('../../../../app-js/src/router').default} Router */
/** @typedef {import('../../../../app-js/src/ws').default} WS */

/**
 * @typedef Props
 * @property {Router} router
 * @property {WS} server
 */

/**
 * The add account.
 * @extends {React.Component<Props>}
 */
export default class RenameAccount extends React.Component {
	/**
	 * Constructs the app.
	 * @param {Props} props
	 */
	constructor(props) {
		super(props);

		this.state = {
			name: '',
			feedback: ''
		};

		this.formChanged = this.formChanged.bind(this);

		this.submitForm = this.submitForm.bind(this);
	}

	async componentDidMount() {
	}

	render() {
		return <>
			<h1>Rename Account</h1>
			<p>The name of the account to be renamed is <b>{this.props.router.getValueOf('name')}</b>.</p>
			<form action="javascript:">
				<label htmlFor="name" className="left">New name:</label>
				<input name="newName" type="text" className="right" onChange={this.formChanged} />
				<button className="submit" onClick={this.submitForm}>Rename Account</button>
				<p>{this.state.feedback}</p>
			</form>
			</>;
	}

	formChanged(event) {
		const input = event.target;
		const state = {};
		state[input.name] = input.value;
		this.setState(state);
	}

	async submitForm(event) {
		// Send the command to the server.
		try {
			await this.props.server.send({
				command: 'rename account',
				name: this.props.router.getValueOf('name'),
				newName: this.state.newName
			});
			this.props.router.push({
				page: 'viewAccount',
				name: this.state.newName
			});
		}
		catch (errorMessage) {
			this.setState({
				feedback: errorMessage
			});
		}
	}
}
