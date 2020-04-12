module.exports = {
	output: {
		filename: 'script.js'
	},
	module: {
		rules: [{
			test: /\.(css|svg|html)$/,
			use: 'raw-loader'
		}]
	}
};
