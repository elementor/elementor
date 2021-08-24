import Module from './imports/module';
import ViewModule from './imports/view-module';
import ArgsObject from './imports/args-object';
import Masonry from './imports/utils/masonry';
import Scroll from './imports/utils/scroll';
import ForceMethodImplementation from './imports/force-method-implementation';

export default window.elementorModules = {
	Module,
	ViewModule,
	ArgsObject,
	ForceMethodImplementation,

	utils: {
		Masonry: Masonry,
		Scroll: Scroll,
	},
};
