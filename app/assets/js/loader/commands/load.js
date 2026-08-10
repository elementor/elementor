export class Load extends $e.modules.CommandBase {
	apply( args ) {
		const component = this.component;

		if ( ! component.iframe ) {
			// Backdrop — click to close.
			component.backdrop = document.createElement( 'div' );
			component.backdrop.className = 'elementor-app-backdrop';
			component.backdrop.style.cssText = '' +
				'display: none;' +
				'position: fixed;' +
				'z-index: 99998;' +
				'top: 0;' +
				'left: 0;' +
				'width: 100%;' +
				'height: 100%;' +
				'background: rgba(0, 0, 0, 0.5);' +
				'opacity: 0;' +
				'transition: opacity 0.25s ease;';
			component.backdrop.addEventListener( 'click', () => {
				$e.run( 'app/close' );
			} );
			document.body.appendChild( component.backdrop );

			// Iframe — overlay instead of full-screen.
			component.iframe = document.createElement( 'iframe' );
			component.iframe.className = 'elementor-app-iframe';
			component.iframe.style.cssText = '' +
				'display: none;' +
				'position: fixed;' +
				'top: 30px;' +
				'left: 40px;' +
				'width: calc(100% - 80px);' +
				'height: calc(100% - 60px);' +
				'z-index: 99999; /* Over WP Admin Bar */' +
				'border-radius: 12px;' +
				'box-shadow: 0 16px 64px rgba(0, 0, 0, 0.3);' +
				'background-color: transparent;' +
				'opacity: 0;' +
				'transition: opacity 0.25s ease;';

			// Fade in both iframe and backdrop once content loads.
			component.iframe.addEventListener( 'load', () => {
				if ( component.iframe ) {
					component.iframe.style.opacity = '1';
				}
				if ( component.backdrop ) {
					component.backdrop.style.opacity = '1';
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
