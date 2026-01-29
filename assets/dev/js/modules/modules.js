import Module from './imports/module';
import ViewModule from './imports/view-module';
import ArgsObject from './imports/args-object';
import Masonry from './imports/utils/masonry';
import Scroll from './imports/utils/scroll';
import ForceMethodImplementation from './imports/force-method-implementation';
import { createGetInitialState } from '../../../../app/modules/import-export-customization/assets/js/shared/utils/template-registry-helpers';
import { customizationDialogsRegistry } from '../../../../app/modules/import-export-customization/assets/js/shared/registry/customization-dialogs';

export default window.elementorModules = {
	Module,
	ViewModule,
	ArgsObject,
	ForceMethodImplementation,

	utils: {
		Masonry,
		Scroll,
	},

	importExport: {
		createGetInitialState,
		customizationDialogsRegistry,
	},
};
