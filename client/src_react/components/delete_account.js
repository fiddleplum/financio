import React from 'react';
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
export default class DeleteAccount extends React.Component {
	/**
	 * Constructs the app.
	 * @param {Props} props
	 */
	constructor(props) {
		super(props);

		this.state = {
			delete: '',
			feedback: ''
		};

		this.formChanged = this.formChanged.bind(this);

		this.submitForm = this.submitForm.bind(this);
	}

	async componentDidMount() {
	}

	render() {
		return <>
			<h1>Delete Account</h1>
			<p>The name of the account to be deleted is <b>{this.props.router.getValueOf('name')}</b>.</p>
			<p>All data associated with the account will be irrecoverably deleted, with no undoing the action.</p>
			<form action="javascript:">
				<p>If you want to delete your account, enter the <b>DELETE</b> in all capital letters:</p>
				<p><input name="delete" type="text" onChange={this.formChanged} /></p>
				<button className="submit" onClick={this.submitForm}>Delete Account</button>
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
		if (this.state.delete === 'DELETE') {
			// Send the command to the server.
			try {
				await this.props.server.send({
					command: 'delete account',
					name: this.props.router.getValueOf('name')
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
		else {
			this.setState({
				feedback: 'Please enter DELETE to delete the account.'
			});
		}
	}
}
