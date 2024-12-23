import BaseHandler from './handlers/base';
import Document from './document';
import StretchElement from './tools/stretch-element';
import StretchedElement from './handlers/stretched-element';
import NestedTabs from 'elementor/modules/nested-tabs/assets/js/frontend/handlers/nested-tabs';

window.elementorModules.frontend = elementorModules?.frontend || {};
elementorModules.frontend.Document = Document;

elementorModules.frontend.tools = {};
elementorModules.frontend.tools.StretchElement = StretchElement;

window.elementorModules.frontend.handlers = elementorModules?.frontend?.handlers || {};
elementorModules.frontend.handlers.Base = BaseHandler;
elementorModules.frontend.handlers.StretchedElement = StretchedElement
elementorModules.frontend.handlers.NestedTabs = NestedTabs;
