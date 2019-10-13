module.exports = {
	output: {
		filename: 'script.js'
	},
	module: {
		rules: [{
			test: /\.(css|svg)$/,
			use: 'raw-loader'
		}]
	}
};
