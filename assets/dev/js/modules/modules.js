import Module from './imports/module';
import ModuleFrontend from './imports/module-frontend';
import ViewModule from './imports/view-module';
import ViewModuleFrontend from './imports/view-module-frontend';
import ArgsObject from './imports/args-object';
import Masonry from './imports/utils/masonry';
import Scroll from './imports/utils/scroll';
import ForceMethodImplementation from './imports/force-method-implementation';

export default window.elementorModules = {
	Module,
	ModuleFrontend,
	ViewModule,
	ViewModuleFrontend,
	ArgsObject,
	ForceMethodImplementation,

	utils: {
		Masonry,
		Scroll,
	},
};
