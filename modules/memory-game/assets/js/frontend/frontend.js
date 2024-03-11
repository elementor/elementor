class PlayingCardsModule extends elementorModules.Module {
	constructor() {
		super();
		elementorFrontend.on( 'elementor/modules/init/before', () => {
			elementorFrontend.elementsHandler.attachHandler( 'memory-game', () => import( /* webpackChunkName: 'memory-game' */ './handlers/memory-game' ) );
		} );
	}
}


new PlayingCardsModule();
