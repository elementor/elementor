import Module from 'elementor-assets-js/modules/imports/module.js';

export default class extends Module {
	constructor() {
		super();

		elementorFrontend.elementsHandler.attachHandler( 'nested-accordion', [
			() => import( /* webpackChunkName: 'nested-accordion' */ './handlers/nested-accordion' ),
			() => import( /* webpackChunkName: 'nested-accordion-title-keyboard-handler' */ './handlers/nested-accordion-title-keyboard-handler' ),
		] );
	}
}
