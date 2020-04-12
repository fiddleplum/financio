import React from 'react';
import './app.css';
import { Router, WS } from '../../../app-js/src/index';
import Utils from './utils';

import Menu from './components/menu';
import Accounts from './components/accounts';
import AddAccount from './components/add_account';
import ViewAccount from './components/view_account';
import DeleteAccount from './components/delete_account';
import RenameAccount from './components/rename_account';
import ImportTransactions from './components/import_transactions';
import Categories from './components/categories';

/**
 * @typedef Props
 */

/**
 * The root class of the app.
 * @extends {React.Component<Props>}
 */
export default class App extends React.Component {
	/**
	 * Constructs the app.
	 * @param {Props} props
	 */
	constructor(props) {
		super(props);

		this.state = {
			title: 'FINANCIO',
			page: '',
			notice: 'Loading...',
			nextPage: ''
		};

		/**
		 * The WebSocket host url.
		 * @type {string}
		 * @private
		 */
		this._serverHost = '//localhost:8081';

		/**
		 * The web socket that connects to the host.
		 * @type {WS}
		 * @private
		*/
		this._ws = new WS(this._serverHost);

		/**
		 * The list of pages.
		 * @type {Object<string, React.Component>}
		 * @private
		 */
		this._pages = {
			menu: Menu,
			accounts: Accounts,
			addAccount: AddAccount,
			viewAccount: ViewAccount,
			deleteAccount: DeleteAccount,
			renameAccount: RenameAccount,
			importTransactions: ImportTransactions,
			categories: Categories
		};

		/**
		 * The router.
		 * @type {Router}
		 * @private
		 */
		this._router = new Router();

		// Setup function callback binds.
		this.showNextPage = this.showNextPage.bind(this);

		// Setup the router callback.
		this._router.setCallback(async (query) => {
			const page = query.page || 'menu';
			this.setState({
				notice: ''
			});
			this.setState((state) => {
				if (state.page !== '') {
					return {
						nextPage: page
					};
				}
				else {
					return {
						page: page
					};
				}
			});
		});
	}

	componentDidMount() {
		// Wait until the web socket is connected.
		this._ws.getReadyPromise().then(() => {
			this._router.processURL();
			this.setState({
				notice: ''
			});
		}).catch(() => {
			this.setState({
				notice: 'No connection could be made.'
			});
		});
	}

	render() {
		const Page = this._pages[this.state.page];
		let page = null;
		if (this.state.notice !== '') {
			page = <div id="notice">{this.state.notice}</div>;
		}
		else if (Page !== undefined) {
			page = <Page router={this._router} server={this._ws} showMessage={this.showMessage.bind(this)} />;
		}
		else {
			page = <div id="notice">Page not found!</div>;
		}

		return <>
			<div id="header"><span id="title" onClick={this.goToHomePage.bind(this)}>{this.state.title}</span><span id="message">{this.state.message}</span></div>
			<div id="page" className={(Page ? Page.name : '') + (this.state.nextPage !== '' ? ' fadeOut' : ' fadeIn')} onTransitionEnd={this.showNextPage}>{page}</div>
			</>;
	}

	showNextPage() {
		if (this.state.nextPage !== '') {
			this.setState((state) => {
				return {
					page: state.nextPage,
					nextPage: ''
				};
			});
		}
	}

	/**
	 * Sends a message to the server.
	 * @param {any} data
	 * @returns {Promise<any, string>}
	 */
	sendToServer(data) {
		return this._ws.send(data);
	}

	/**
	 * Shows a message.
	 * @param {string} message
	 */
	showMessage(message) {
		this.setState({
			message: message
		});
	}

	goToHomePage() {
		this._router.pushQuery({
			page: ''
		});
	}
}
