const elementorEditorPlugin = require('./packages/tools/eslint-plugin-editor/dist/index.js');

module.exports = {
	'no-react-namespace': elementorEditorPlugin.rules['no-react-namespace'],
}; 