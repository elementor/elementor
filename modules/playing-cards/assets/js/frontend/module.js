export default class Module extends elementorModules.Module {
	constructor() {
		super();
		elementorFrontend.on( 'elementor/modules/init/before', () => {
			elementorFrontend.elementsHandler.attachHandler( 'playing-cards-handlers', () => import( /* webpackChunkName: 'playing-cards-handlers' */ './handlers/playing-card-handler') );
		} );
	}
}

new Module();
