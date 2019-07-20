module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'index.js'
	},
	module: {
		rules: [{
			test: /\.css$/i,
			use: ['css-loader']
		}]
	}
};
