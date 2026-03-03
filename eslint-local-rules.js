const elementorEditorPlugin = require('./packages/libs/eslint-plugin-editor/dist/index.js');

module.exports = {
	'no-react-namespace': elementorEditorPlugin.rules['no-react-namespace'],
}; 