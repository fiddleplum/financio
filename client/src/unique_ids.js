class UniqueIds {
	constructor() {
		this._freeIds = [];

		this._numUsed = 0;
	}

	get() {
		let id;
		if (this._freeIds.length === 0) {
			id = this._numUsed;
		}
		else {
			id = this._freeIds.pop();
		}
		this._numUsed += 1;
		return id;
	}

	release(id) {
		this._freeIds.push(id);
		this._numUsed -= 1;
	}
}

export default UniqueIds;
