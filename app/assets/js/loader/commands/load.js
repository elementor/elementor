export class Load extends $e.modules.CommandBase {
	apply( args ) {
		const component = this.component;

		if ( ! component.iframe ) {
			component.iframe = document.createElement( 'iframe' );
			component.iframe.className = 'elementor-app-iframe';
			component.iframe.style.cssText = '' +
				'display: none;' +
				'width: 100%;' +
				'height: 100%;' +
				'position: fixed;' +
				'top: 0;' +
				'left: 0;' +
				'z-index: 99999; /* Over WP Admin Bar */' +
				'background-color: rgba(0, 0, 0, 0.8);';

			document.body.appendChild( component.iframe );
		}

		if ( args.url === component.iframe.src ) {
			return;
		}

		component.iframe.src = args.url;
	}
}

export default Load;
