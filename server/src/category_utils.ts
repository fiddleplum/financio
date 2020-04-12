import fs from 'fs';

// The categories file is just a JSON array containing either string names or a key-value pair,
// with the first being a name and the second being a similar JSON array.

type Category = string | [string, Category[]];

export default class CategoryUtils {
	/**
	 * Gets the categories from the categories file.
	 * @returns {Category[]}
	 */
	static get() {
		if (fs.existsSync('data/categories.json')) {
			return JSON.parse(fs.readFileSync('data/categories.json').toString());
		}
		return [];
	}

	/**
	 * Sets the categories to the categories file.
	 * @param {Category[]} categories
	 */
	static set(categories: Category[]) {
		// Create the .json file.
		try {
			fs.writeFileSync('data/categories.json', JSON.stringify(categories));
		}
		catch (error) {
			throw new Error('Error: The file "data/categories.json" could not be written to. ' + error);
		}
	}
}
