import Module from './imports/module';
import ViewModule from './imports/view-module';
import Masonry from './imports/utils/masonry';

export default window.elementorModules = {
	Module: Module,
	ViewModule: ViewModule,
	utils: {
		Masonry: Masonry,
	},
};
