import elementorModules from '../modules/modules';
import Document from './document';
import StretchElement from './tools/stretch-element';
import BaseHandler from './handlers/base';

elementorModules.frontend = {
	Document: Document,
	tools: {
		StretchElement: StretchElement,
	},
	handlers: {
		Base: BaseHandler,
	},
};
