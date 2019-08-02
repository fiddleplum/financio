module.exports = {
	output: {
		filename: 'script.js'
	},
	module: {
		rules: [{
			test: /\.css$/,
			use: ['style-loader', {
				loader: 'css-loader',
				options: {
					url: false
				}
			}]
		}, {
			test: /\.svg$/,
			use: [{
				loader: 'babel-loader'
			}, {
				loader: 'react-svg-loader',
				options: {
					svgo: {
						plugins: [{
							removeTitle: false
						}],
						floatPrecision: 2
					}
				}
			}]
		}, {
			test: /\.(js|jsx)$/,
			exclude: /node_modules/,
			loaders: [{
				loader: 'babel-loader',
				query: {
					presets: ['@babel/preset-react']
				}
			}]
		}]
	}
};
