import Module from './imports/module';
import ModuleFrontend from './imports-frontend/module';
import ViewModule from './imports/view-module';
import ViewModuleFrontend from './imports-frontend/view-module';
import ArgsObject from './imports/args-object';
import Masonry from './imports-frontend/utils/masonry';
import Scroll from './imports-frontend/utils/scroll';
import ForceMethodImplementation from './imports/force-method-implementation';

const isWpAdmin = window.location.pathname.indexOf( 'wp-admin' ) !== -1 ||
		document.body.classList.contains( 'wp-admin' ) ||
		document.body.classList.contains( 'admin-bar' ) ||
		document.body.classList.contains( 'logged-in' ),
	isElementorEditor = document.body.classList.contains( 'elementor-editor-active' ),
	isFrontend = ! isWpAdmin && ! isElementorEditor;

export default window.elementorModules = {
	Module: isFrontend ? null : Module,
	ModuleFrontend,
	ViewModule: isFrontend ? null : ViewModule,
	ViewModuleFrontend,
	ArgsObject,
	ForceMethodImplementation,

	utils: {
		Masonry,
		Scroll,
	},
};
