import React from 'react';
import './ordered_tree.css';

/*

When you grab a group category, it moves the whole group together, whether up or down or outward or inward.
When you move a child category outside of its parent, it moves up to the parent level.

*/

/**
 * @template Item
 * @typedef {Item|Array<Entry>} Entry
 */

/**
 * @template Item
 * @typedef Props
 * @property {Array<Entry>} entries
 */

/**
 * The accounts page.
 * @template Item
 * @extends {React.Component<Props>}
 */
export default class OrderedTree extends React.Component {
	/**
	 * Constructs the app.
	 * @param {Props} props
	 */
	constructor(props) {
		super(props);

		this.state = {
			selected: false,
			dragging: false
		}

		this.onButtonPress = this.onButtonPress.bind(this);
		this.onButtonRelease = this.onButtonRelease.bind(this);
		this.onDragStart = this.onDragStart.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);
		this.onDragMove = this.onDragMove.bind(this);
		this.buttonPressTimer = null;
	}

	render() {
		return <div className="OrderedTree">{this.renderEntries(this.props.entries)}</div>;
	}

	renderEntries(entries, level = 0) {
		const jsx = [];
		for (let i = 0, l = entries.length; i < l; i++) {
			const jsxEntry = [];
			if (this.state.selected === entries[i]) {
				jsxEntry.push(<p className="entry" key={entries[i]}>
						<button className="grabber"
							onMouseDown={this.onDragStart}
							onTouchStart={this.onDragStart}
							onMouseUp={this.onDragEnd}
							onTouchEnd={this.onDragEnd}
							onMouseMove={this.onDragMove}>#</button>
						<input type="text" defaultValue={entries[i]}></input>
					</p>);
			}
			else {
				jsxEntry.push(<p className="entry" key={entries[i]}
					onTouchStart={this.onButtonPress}
					onTouchEnd={this.onButtonRelease}
					onMouseDown={this.onButtonPress}
					onMouseUp={this.onButtonRelease}
					onMouseLeave={this.onButtonRelease}>{entries[i]}</p>);
			}
			if (i < entries.length - 1 && Array.isArray(entries[i + 1])) {
				const collapse = this.state.selected === entries[i] && this.state.dragging;
				jsxEntry.push(<div className={"children" + (collapse ? " collapsed" : "")} key={entries[i] + '_children'}>{this.renderEntries(entries[i + 1], level + 1)}</div>);
				jsxEntry.push(<p className={"ellipses" + (collapse ? " collapsed" : "")} key={entries[i] + '_ellipses'} style={{marginLeft: (level + 1) + 'em'}}>···</p>);
				i++;
			}
			jsx.push(<div className="entry" key={entries[i]}>{jsxEntry}</div>);
		}
		return jsx;
	}

	onButtonPress(event) {
		const entry = event.target.innerHTML;
		this.buttonPressTimer = setTimeout(() => {
			this.setState({
				selected: entry
			});
			console.log('selected ' + entry);
		}, 1500);
	}

	onButtonRelease() {
		clearTimeout(this.buttonPressTimer);
	}

	onDragStart(event) {
		this.setState({
			dragging: true
		});
	}

	onDragEnd(event) {
		this.setState({
			dragging: false
		});
	}

	onDragMove(event) {
	}
}
