import elementorModules from '../modules/modules';
import Document from './document';
import StretchElement from './tools/stretch-element';
import StretchedElement from './handlers/stretched-element';
import BaseHandler from './handlers/base';
import NestedTabs from 'elementor/modules/nested-tabs/assets/js/frontend/handlers/nested-tabs';

elementorModules.frontend = {
	Document,
	tools: {
		StretchElement,
	},
};

elementorModules.frontend.handlers = elementorModules.frontend.handlers || {};
elementorModules.frontend.handlers.Base = BaseHandler;
elementorModules.frontend.handlers.StretchedElement = StretchedElement;
elementorModules.frontend.handlers.NestedTabs = NestedTabs;
