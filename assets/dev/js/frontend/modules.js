import elementorModules from '../modules/modules';
import Document from './document';
import StretchElement from './tools/stretch-element';
import StretchedElement from './handlers/stretched-element';
import BaseHandler from './handlers/base';
import SwiperBase from './handlers/base-swiper';
import CarouselBase from './handlers/base-carousel';
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

( async () => {
	const { default: NestedTabs } = await import( /* webpackChunkName: 'nested-tabs-module' */ 'elementor/modules/nested-tabs/assets/js/frontend/handlers/nested-tabs' );
	elementorModules.frontend.handlers.NestedTabs = NestedTabs;
} )();
