import EditorModule from '../editor/utils/module';
import ControlsStack from '../editor/views/controls-stack';
import BaseSettings from '../editor/elements/models/base-settings';

elementorModules.editor = {
	elements: {
		models: {
			BaseSettings: BaseSettings,
		},
	},
	utils: {
		Module: EditorModule,
	},
	views: {
		ControlsStack: ControlsStack,
	},
};
