import Module from './imports/module';
import Component from './imports/component';
import ViewModule from './imports/view-module';
import Masonry from './imports/utils/masonry';

export default window.elementorModules = {
	Module: Module,
	Component: Component,
	ViewModule: ViewModule,
	utils: {
		Masonry: Masonry,
	},
};
