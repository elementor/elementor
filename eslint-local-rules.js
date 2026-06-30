const elementorEditorPlugin = require('./packages/packages/tools/eslint-plugin-editor/dist/index.js');

module.exports = {
  'no-path-imports': elementorEditorPlugin.rules['no-path-imports'],
  'no-react-namespace': elementorEditorPlugin.rules['no-react-namespace'],
};
