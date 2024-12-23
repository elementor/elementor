import Document from './document';
import StretchElement from './tools/stretch-element';
import StretchedElement from './handlers/stretched-element';
import NestedTabs from 'elementor/modules/nested-tabs/assets/js/frontend/handlers/nested-tabs';

elementorModules.frontend.Document = Document;

elementorModules.frontend.tools = {};
elementorModules.frontend.tools.StretchElement = StretchElement;

elementorModules.frontend.handlers.StretchedElement = StretchedElement
elementorModules.frontend.handlers.NestedTabs = NestedTabs;
