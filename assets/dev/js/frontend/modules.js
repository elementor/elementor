import elementorModules from '../modules/modules';
import Document from './document';
import StretchElement from './tools/stretch-element';
import BaseHandler from './handlers/base';
import SwiperBase from './handlers/base-swiper';
import TabsV2 from 'elementor/modules/tabs-v2/assets/js/frontend/handlers/tabs-v2';

elementorModules.frontend = {
	Document: Document,
	tools: {
		StretchElement: StretchElement,
	},
	handlers: {
		Base: BaseHandler,
		SwiperBase: SwiperBase,
		TabsV2: TabsV2,
	},
};
