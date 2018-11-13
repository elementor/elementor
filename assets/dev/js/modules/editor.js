import elementorModules from './common';

import EditorModule from '../editor/utils/editor-module';

elementorModules.editor = {
	utils: {
		Module: EditorModule,
	},
};

export default elementorModules;
