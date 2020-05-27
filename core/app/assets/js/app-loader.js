import './app-loader.scss';

class AppLoader {
	selector = 'a.elementor-app-link';
	iframe;

	constructor() {
		window.addEventListener( 'DOMContentLoaded', this.onLoad.bind( this ) );
	}

	onLoad() {
		const links = document.querySelectorAll( this.selector );

		if ( ! links.length ) {
			return;
		}

		links.forEach( ( link ) => {
			link.addEventListener( 'click', ( event ) => {
				event.preventDefault();
				this.openApp( link.href );
			} );

			link.addEventListener( 'mouseenter', () => {
				this.loadApp( link.href );
			} );
		} );
	}

	loadApp( url ) {
		if ( ! this.iframe ) {
			this.iframe = document.createElement( 'iframe' );
			this.iframe.className = 'elementor-app-iframe';
			this.iframe.style.display = 'none';
			document.body.appendChild( this.iframe );
		}

		this.iframe.src = url.replace( 'elementor-app', 'elementor-app&mode=iframe' );
	}

	openApp( url ) {
		this.loadApp( url );

		this.iframe.style.display = '';
		document.body.style.overflow = 'hidden';
	}

	closeApp() {
		this.iframe.style.display = 'none';
		document.body.style.overflow = '';
	}
}

window.elementorAppLoader = new AppLoader();
