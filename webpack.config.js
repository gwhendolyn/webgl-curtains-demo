const path = require('path');

module.exports = {
    target: 'node',
    entry: './scripts/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};