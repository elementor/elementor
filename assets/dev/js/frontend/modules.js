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

// if ( window.NestedTabs ) {
// 	elementorModules.frontend.handlers.NestedTabs = window.NestedTabs;
// }

const hasModule = document.querySelector( '#widget-nested-tabs-js-module' );

console.log( 'has module', !! elementorModules.frontend.handlers.NestedTabs );
console.log( 'has selector', !! hasModule );
