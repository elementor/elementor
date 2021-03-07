export default class extends elementorModules.Module {
	constructor() {
		super();

		elementorFrontend.elementsHandler.attachHandler( 'wordart', () => import( /* webpackChunkName: 'word-art' */ './handlers/word-art' ) );
	}
}
