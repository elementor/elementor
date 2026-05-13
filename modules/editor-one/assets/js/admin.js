document.addEventListener( 'DOMContentLoaded', function() {
	const urlParams = new URLSearchParams( window.location.search );

	if ( 'elementor-element-manager' === urlParams.get( 'page' ) ) {
		const links = document.querySelectorAll( 'link[href*="/wp-admin/css/forms.css"]' );
		links.forEach( ( link ) => link.remove() );
	}
} );
