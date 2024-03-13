

class PlayingCardsModule extends elementorModules.Module  {
    constructor() {
       super();
       elementorFrontend.on( 'elementor/modules/init/before', () => {
          elementorFrontend.elementsHandler.attachHandler( 'playing-cards', () => import( /* webpackChunkName: 'playing-cards' */ './handlers/playing-cards') );
       } );
    }
}


new PlayingCardsModule();