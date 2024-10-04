import elementorModules from '../modules/modules';
import Document from './document';
import StretchElement from './tools/stretch-element';
import StretchedElement from './handlers/stretched-element';
import BaseHandler from './handlers/base';
import SwiperBase from './handlers/base-swiper';
import CarouselBase from './handlers/base-carousel';
// import NestedTabs from 'elementor/modules/nested-tabs/assets/js/frontend/handlers/nested-tabs';
import ContactButtonsHandler from 'elementor/modules/floating-buttons/assets/js/floating-buttons/frontend/handlers/contact-buttons';
import FloatingBarsHandler from 'elementor/modules/floating-buttons/assets/js/floating-bars/frontend/handlers/floating-bars';

elementorModules.frontend = {
	Document,
	tools: {
		StretchElement,
	},
	handlers: {
		Base: BaseHandler,
		StretchedElement,
		SwiperBase,
		CarouselBase,
		ContactButtonsHandler,
		FloatingBarsHandler,
	},
};

const isEditor = ! window.elementorCommon;

// TODO: Remove in v3.27.0 [ED-15717]
// Load NestedTabs module only when older Pro versions are active.
if ( isEditor || ! elementorCommon.config.experimentalFeatures.update_core_js_modules_loading ) {
	elementorModules.frontend.handlers.NestedTabs = () => import( /* webpackChunkName: 'nested-tabs-module' */ 'elementor/modules/nested-tabs/assets/js/frontend/handlers/nested-tabs' );
}
