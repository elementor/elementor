export default class extends elementorModules.Module {
	constructor() {
		super();

		elementorFrontend.elementsHandler.attachHandler( 'nested-tabs', () => import( /* webpackChunkName: 'nested-tabs' */ './handlers/tabs-v2' ) );
	}
}
