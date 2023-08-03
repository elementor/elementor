import elementorModules from '../modules/modules';
import Document from './document';
import StretchElement from './tools/stretch-element';
import StretchedElement from './handlers/stretched-element';
import BaseHandler from './handlers/base';
import SwiperBase from './handlers/base-swiper';
import CarouselBase from './handlers/base-carousel';
import NestedTabs from 'elementor/modules/nested-tabs/assets/js/frontend/handlers/nested-tabs';
import NestedTabsHtml from 'elementor/modules/nested-tabs-html/assets/js/frontend/handlers/nested-tabs-html';
import NestedAccordion from 'elementor/modules/nested-accordion/assets/js/frontend/handlers/nested-accordion';

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
		NestedTabs,
		NestedTabsHtml,
		NestedAccordion,
	},
};
