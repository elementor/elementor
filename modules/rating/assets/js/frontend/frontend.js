export default class extends elementorModules.Module {
	constructor() {
		super();
		elementorFrontend.elementsHandler.attachHandler( 'rating', () => import( /* webpackChunkName: 'rating' */ './handlers/rating' ) );
	}
}
