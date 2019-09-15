import React from 'react';
import Transactions from './transactions';
import './view_account.css';
import TrashSVG from './trash.svg';
import EditSVG from './edit.svg';
/** @typedef {import('../../../../app-js/src/router').default} Router */
/** @typedef {import('../../../../app-js/src/ws').default} WS */

/**
 * @typedef Props
 * @property {Router} router
 * @property {WS} server
 */

/**
 * The transactions page.
 * @extends {React.Component<Props>}
 */
export default class ViewAccount extends React.Component {
	/**
	 * Constructs the app.
	 * @param {Props} props
	 */
	constructor(props) {
		super(props);

		this.state = {
			feedback: ''
		};

		this.goToRenameAccount = this.goToRenameAccount.bind(this);
		this.goToDeleteAccount = this.goToDeleteAccount.bind(this);
	}

	async componentDidMount() {
	}

	render() {
		const name = this.props.router.getValueOf('name');
		return <>
			<h1>{name}<div className="toolbar">
				<button onClick={this.goToRenameAccount}><EditSVG /></button> <button onClick={this.goToDeleteAccount}><TrashSVG /></button>
			</div>
			</h1>
			<Transactions router={this.props.router} server={this.props.server} />
			</>;
	}

	goToRenameAccount() {
		this.props.router.push({
			page: 'renameAccount',
			name: this.props.router.getValueOf('name')
		});
	}

	goToDeleteAccount() {
		this.props.router.push({
			page: 'deleteAccount',
			name: this.props.router.getValueOf('name')
		});
	}
}
