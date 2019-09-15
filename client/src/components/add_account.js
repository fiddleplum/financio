import React from 'react';
import './add_account.css';
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
export default class AddAccount extends React.Component {
	/**
	 * Constructs the app.
	 * @param {Props} props
	 */
	constructor(props) {
		super(props);

		this.state = {
			name: '',
			type: '',
			feedback: ''
		};

		this.formChanged = this.formChanged.bind(this);

		this.submitForm = this.submitForm.bind(this);
	}

	async componentDidMount() {
	}

	render() {
		return <>
			<h1>Add an Account</h1>
			<form action="javascript:">
				<label htmlFor="name" className="left">Name:</label>
				<input name="name" type="text" className="right name" onChange={this.formChanged} />
				<label htmlFor="type" className="left">Type:</label>
				<select name="type" className="right type" onChange={this.formChanged}>
					<option value="credit">Credit</option>
					<option value="debit">Debit</option>
				</select>
				<button className="submit" onClick={this.submitForm}>Add Account</button>
				<div>{this.state.feedback}</div>
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
				command: 'create account',
				name: this.state.name,
				type: this.state.type
			});
			this.props.router.push({
				page: 'accounts'
			});
		}
		catch (errorMessage) {
			this.setState({
				feedback: errorMessage
			});
		}
	}
}
