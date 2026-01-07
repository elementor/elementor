document.addEventListener( 'DOMContentLoaded', function() {
	const urlParams = new URLSearchParams( window.location.search );

	if ( 'elementor-element-manager' === urlParams.get( 'page' ) ) {
		const links = document.querySelectorAll( 'link[href*="/wp-admin/css/forms.css"]' );
		links.forEach( ( link ) => link.remove() );
	}

	observeHeaderButtons();
} );

function observeHeaderButtons() {
	const wrap = document.querySelector( '.wrap' );
	if ( ! wrap ) {
		return;
	}

	if ( tryReorderHeaderButtons( wrap ) ) {
		return;
	}

	const observer = new MutationObserver( () => {
		if ( tryReorderHeaderButtons( wrap ) ) {
			observer.disconnect();
		}
	} );

	observer.observe( wrap, { childList: true } );
}

function tryReorderHeaderButtons( wrap ) {
	const buttons = wrap.querySelectorAll( ':scope > .page-title-action' );
	if ( buttons.length < 2 ) {
		return false;
	}

	const primaryButton = Array.from( buttons ).find( ( btn ) => ! btn.classList.contains( 'button-secondary' ) );
	if ( ! primaryButton ) {
		return false;
	}

	const secondaryButtons = Array.from( buttons ).filter( ( btn ) => btn.classList.contains( 'button-secondary' ) );
	secondaryButtons.forEach( ( btn ) => {
		primaryButton.before( btn );
	} );

	return true;
}
