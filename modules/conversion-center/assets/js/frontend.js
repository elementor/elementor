export default class extends elementorModules.Module {
	constructor() {
		super();

		elementorFrontend.elementsHandler.attachHandler( 'contact-buttons', () => import( /* webpackChunkName: 'contact-buttons' */ './handlers/contact-buttons' ) );
	}
}
