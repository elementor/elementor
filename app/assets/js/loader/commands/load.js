export class Load extends $e.modules.CommandBase {
	apply( args ) {
		const component = this.component;

		if ( ! component.iframe ) {
			// Backdrop — click to close.
			component.backdrop = document.createElement( 'div' );
			component.backdrop.className = 'elementor-app-backdrop';
			component.backdrop.style.display = 'none';
			component.backdrop.addEventListener( 'click', () => {
				$e.run( 'app/close' );
			} );
			document.body.appendChild( component.backdrop );

			// Iframe — overlay instead of full-screen.
			component.iframe = document.createElement( 'iframe' );
			component.iframe.className = 'elementor-app-iframe';
			component.iframe.style.display = 'none';

			// Fade in both iframe and backdrop once content loads.
			component.iframe.addEventListener( 'load', () => {
				if ( component.iframe ) {
					component.iframe.classList.add( 'elementor-app-iframe--visible' );
				}
				if ( component.backdrop ) {
					component.backdrop.classList.add( 'elementor-app-backdrop--visible' );
				}
			} );

			document.body.appendChild( component.iframe );
		}

		if ( args.url === component.iframe.src ) {
			return;
		}

		component.iframe.src = args.url;
	}
}

export default Load;
