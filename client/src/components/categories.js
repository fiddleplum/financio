import React from 'react';
import './categories.css';
import OrderedTree from './ordered_tree';
import OrderedList from './ordered_list';
/** @typedef {import('../../../../app-js/src/router').default} Router */
/** @typedef {import('../../../../app-js/src/ws').default} WS */

/*

When you grab a group category, it moves the whole group together, whether up or down or outward or inward.
When you move a child category outside of its parent, it moves up to the parent level.

*/


/**
 * @typedef Props
 * @property {Router} router
 * @property {WS} server
 */

/**
 * @typedef {string|Array<Category>} Category
 */

/**
 * The accounts page.
 * @extends {React.Component<Props>}
 */
export default class Categories extends React.Component {
	/**
	 * Constructs the app.
	 * @param {Props} props
	 */
	constructor(props) {
		super(props);

		this.state = {
			/**
			 * The list of account names.
			 * @type {Array<Category>}
			 */
			categories: [],

			/**
			 * The currently selected category.
			 * @type {string}
			 */
			selected: '',

			/**
			 * If something has changed, this is true.
			 * @type {boolean}
			 */
			modified: false
		};

	}

	async componentDidMount() {
		/** @type string[]} */
		const categories = await this.props.server.send({
			command: 'get categories'
		});
		this.setState({
			categories: categories
		});
	}

	render() {
		const list = ['apple', 'orange', 'pear', 'avacado', 'nectarine'];
		return <>
			<h1>Testing</h1>
			<OrderedList entries={list}></OrderedList>
			<h1>Categories</h1>
			<p><button>Save</button></p>
			{/* <OrderedTree entries={this.state.categories} /> */}
			<button>+ New Category +</button>
			</>;
	}

	renderCategories(categories, level) {
		const jsx = [];
		for (let i = 0; i < categories.length; i++) {
			if (typeof categories[i] === 'string') {
				if (this.state.selected === categories[i]) {
					jsx.push(<p className="category" style={{marginLeft: level + 'em'}} key={categories[i]}>
							<button className="grabber"
								onMouseDown={this.onDragStart}
								onTouchStart={this.onDragStart}
								onMouseUp={this.onDragEnd}
								onMouseLeave={this.onDragEnd}
								onTouchEnd={this.onDragEnd}>#</button>
							<input type="text" defaultValue={categories[i]}></input>
						</p>);
				}
				else {
					jsx.push(<p className="category" style={{marginLeft: level + 'em'}} key={categories[i]}
						onTouchStart={this.onButtonPress}
						onTouchEnd={this.onButtonRelease}
						onMouseDown={this.onButtonPress}
						onMouseUp={this.onButtonRelease}
						onMouseLeave={this.onButtonRelease}>{categories[i]}</p>);
				}
			}
			else {
				jsx.push(this.renderCategories(categories[i], level + 1));
			}
		}
		return jsx;
	}
}
