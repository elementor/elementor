import EditorModule from './utils/module';
import Introduction from '../utils/introduction';
import ControlsStack from './views/controls-stack';
import BaseSettings from './elements/models/base-settings';
import Container from './container/container';

elementorModules.editor = {
	elements: {
		models: {
			BaseSettings,
		},
	},
	utils: {
		Module: EditorModule,
		Introduction,
	},
	views: {
		ControlsStack,
	},

	Container,
};
