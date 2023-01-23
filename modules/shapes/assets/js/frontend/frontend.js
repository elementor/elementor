export default class extends elementorModules.Module {
	constructor() {
		super();

		elementorFrontend.elementsHandler.attachHandler( 'text-path', () => import( /* webpackChunkName: 'text-path' */ './handlers/text-path' ) );
	}
}
