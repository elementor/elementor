export default class extends elementorModules.Module {
	constructor() {
		super();

		elementorFrontend.elementsHandler.attachHandler( 'tabs-v2',
			() => import( /* webpackChunkName: 'nested-tabs' */ './handlers/tabs-v2' )
		);
	}
}
