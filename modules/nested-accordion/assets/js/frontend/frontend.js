export default class extends elementorModules.Module {
	constructor() {
		super();

		elementorFrontend.elementsHandler.attachHandler( 'nested-accordion', [
			() => import( /* webpackChunkName: 'nested-accordion' */ './handlers/nested-accordion' ),
			() => import( /* webpackChunkName: 'nested-accordion-title-keyboard-handler' */ './handlers/nested-accordion-title-keyboard-handler' ),
		] );
	}
}
