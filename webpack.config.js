module.exports = {
    devtool: 'source-map',
    module: {
        rules: [
            { test: /\.ts$/, loader: 'ts-loader' }
        ]
    },
    output: {
        path: __dirname,
        filename: 'app.js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
}
