import Component from './loader/component';

class AppLoader {
	selector = 'a.elementor-app-link, .elementor-app-link .ab-item';

	constructor() {
		$e.components.register( new Component() );

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
				$e.run( 'app/open', {
					url: link.href,
				} );
			} );

			link.addEventListener( 'mouseenter', () => {
				$e.run( 'app/load', {
					url: link.href,
				} );
			} );
		} );
	}
}

window.elementorAppLoader = new AppLoader();
