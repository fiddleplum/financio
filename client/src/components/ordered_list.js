import React from 'react';
import './ordered_list.css';

/**
 * @template Item
 * @typedef Props
 * @property {Array<Item>} entries
 */

/**
 * A draggable ordered list.
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
			draggable: true,
			dragging: false,
			dragIndex: 0,
			dragPositionStart: 0,
			dragPositionCurrent: 0
		}

		this.onDragStart = this.onDragStart.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);
		this.onDragMove = this.onDragMove.bind(this);
	}

	render() {
		const jsx = [];
		const draggingTop = this.state.dragPositionCurrent - this.state.dragPositionStart + this.state.dragOffset;
		for (let i = 0, l = this.props.entries.length; i < l; i++) {
			let className = "item" + (this.state.dragging ? " dragging" : "");
			if (this.state.dragging && this.state.dragIndex === i) {
				className += " placeholder";
			}
			jsx.push(<div className={className} key={i} data-key={i}
				onMouseDown={this.onDragStart}
				onTouchStart={this.onDragStart}
				>{this.props.entries[i]}</div>);
		}
		if (this.state.dragging) {
			jsx.push(<div className="item dragged" key="dragged" style={{top: draggingTop}}>{this.props.entries[this.state.dragIndex]}</div>);
		}
		return <div className={"OrderedList"}>{jsx}</div>;
	}

	componentDidMount() {
		document.addEventListener('mouseup', this.onDragEnd);
		document.addEventListener('touchend', this.onDragEnd);
		document.addEventListener('mousemove', this.onDragMove);
	}

	componentWillUnmount() {
		document.removeEventListener('mouseup', this.onDragEnd);
		document.removeEventListener('touchend', this.onDragEnd);
		document.removeEventListener('mousemove', this.onDragMove);
	}

	onDragStart(event) {
		const dragIndex = Number.parseInt(event.target.getAttribute('data-key'));
		console.log(event.target.clientTop + ' ' + event.target.offsetTop);
		console.log('start: ' + event.clientY);
		this.setState({
			dragging: true,
			dragIndex: dragIndex,
			dragPositionStart: event.clientY,
			dragPositionCurrent: event.clientY,
			dragOffset: event.target.offsetTop
		});
	}

	onDragEnd(event) {
		this.setState({
			dragging: false
		});
	}

	onDragMove(event) {
		if (this.state.dragging) {
			console.log('move: ' + event.clientY);
			this.setState({
				dragPositionCurrent: event.clientY
			});
		}
	}
}
