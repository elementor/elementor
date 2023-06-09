export default function runElementHandlers( elements ) {
	[ ...elements ]
		.flatMap( ( el ) => [ ...el.querySelectorAll( '.elementor-element, .elementor-background-video-container' ) ] )
		.forEach( ( el ) => {
			elementorFrontend.elementsHandler.runReadyTrigger( el );

			if ( el.classList.contains( 'elementor-background-video-container' ) ) {
				elementorFrontend.elements.$window.trigger( 'elementor/runElementHandlers', el );
			}
		} );
}
