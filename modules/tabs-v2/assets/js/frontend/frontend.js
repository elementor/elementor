export default class extends elementorModules.Module {
	constructor() {
		super();

		elementorFrontend.elementsHandler.attachHandler( 'tabs-v2',
			() => import( /* webpackChunkName: 'tabs-v2' */ './handlers/tabs-v2' )
		);
	}
}
