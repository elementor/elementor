import elementorModules from '../modules/modules';
import Document from './document';
import StretchElement from './tools/stretch-element';
import StretchedElement from './handlers/stretched-element';
import BaseHandler from './handlers/base';
import SwiperBase from './handlers/base-swiper';
import CarouselBase from './handlers/base-carousel';

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
	},
};

// TODO: Remove this check after Elementor 3.28 release.
const isVersionLowerThan3Point28 = true;

if ( !! document.querySelector( 'body.e-import-script-nested-tabs' )?.length || isVersionLowerThan3Point28 ) {
	( async () => {
		const { default: NestedTabs } = await import( /* webpackChunkName: 'nested-tabs-module' */ 'elementor/modules/nested-tabs/assets/js/frontend/handlers/nested-tabs' );
		elementorModules.frontend.handlers.NestedTabs = NestedTabs;
	} )();
}
