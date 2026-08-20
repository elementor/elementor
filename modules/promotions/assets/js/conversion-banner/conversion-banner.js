const CONTAINER_ID = 'e-conversion-banner';
const READY_CLASS = 'e-conversion-banner--ready';

const relocateBanner = ( container, placement ) => {
	const { selector, before = false } = placement;
	const anchor = document.querySelector( selector );

	if ( ! anchor ) {
		container.remove();
		return;
	}

	anchor.insertAdjacentElement( before ? 'beforebegin' : 'afterend', container );
	container.classList.add( READY_CLASS );
};

const bindDismiss = ( container ) => {
	const dismissButton = container.querySelector( '.e-conversion-banner__dismiss' );

	if ( ! dismissButton ) {
		return;
	}

	dismissButton.addEventListener( 'click', async () => {
		try {
			await wp.ajax.post( eConversionBanner.action, { nonce: eConversionBanner.nonce } );
		} catch ( e ) {
		} finally {
			container.remove();
		}
	} );
};

const init = () => {
	const container = document.getElementById( CONTAINER_ID );

	if ( ! container || 'undefined' === typeof eConversionBanner ) {
		return;
	}

	relocateBanner( container, eConversionBanner.placement );
	bindDismiss( container );
};

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
