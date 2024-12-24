import elementorModules from '../modules/modules';
import Document from './document';
import StretchElement from './tools/stretch-element';
import StretchedElement from './handlers/stretched-element';
import BaseHandler from './handlers/base';

elementorModules.frontend = {
	Document,
	tools: {
		StretchElement,
	},
};

elementorModules.frontend.handlers = elementorModules.frontend.handlers || {};
elementorModules.frontend.handlers.Base = BaseHandler;
elementorModules.frontend.handlers.StretchedElement = StretchedElement;
