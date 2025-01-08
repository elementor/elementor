import elementorModules from '../modules/modules';
import Document from './document';
import StretchElement from './tools/stretch-element';
import StretchedElement from './handlers/stretched-element';
import BaseHandler from './handlers/base';
import SwiperBase from './handlers/base-swiper';
import CarouselBase from './handlers/base-carousel';
import NestedTabs from 'elementor/modules/nested-tabs/assets/js/frontend/handlers/nested-tabs';

elementorModules.frontend = {
	Document,
	tools: {
		StretchElement,
	},
	handlers: {
		Base: BaseHandler,
		StretchedElement,
		SwiperBase,
		CarouselBase, // TODO: Remove this in Elementor v3.29 [ED-16272]
		NestedTabs, // TODO: Remove this in Elementor v3.28 [ED-16258]
	},
};
