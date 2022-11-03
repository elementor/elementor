document.addEventListener( 'DOMContentLoaded', function() {
    const dataAttribute = 'data-e-bg-lazyload';
    const lazyloadBackgrounds = document.querySelectorAll( `[${ dataAttribute }]:not(.lazyloaded)` );
    const lazyloadBackgroundObserver = new IntersectionObserver( ( entries ) => {
        entries.forEach( ( entry ) => {
            if ( entry.isIntersecting ) {
                let [ lazyloadBackground, element ] = [ entry.target, entry.target ];

                const lazyloadSelector = lazyloadBackground.getAttribute( dataAttribute );
                if ( lazyloadSelector ) {
                    lazyloadBackground = lazyloadSelector;
                }

                lazyloadBackground.classList.add( 'lazyloaded' );
                lazyloadBackgroundObserver.unobserve( element );
            }
        } );
    } );
    lazyloadBackgrounds.forEach( ( lazyloadBackground ) => {
        lazyloadBackgroundObserver.observe( lazyloadBackground );
    } );
} );
