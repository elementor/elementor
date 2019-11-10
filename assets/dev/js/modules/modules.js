import Module from './imports/module';
import ViewModule from './imports/view-module';
import ArgsObject from './imports/args-object';
import Masonry from './imports/utils/masonry';

export default window.elementorModules = {
	Module,
	ViewModule,
	ArgsObject,

	utils: {
		Masonry: Masonry,
	},
};
