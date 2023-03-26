import Component from './loader/component';
import { userEventMeta, systemEventMeta } from '@elementor/events';

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
				$e.run(
					'app/open',
					{
						url: link.href,
					},
					userEventMeta( {
						source: 'wp-admin-bar',
						interaction: 'click',
					} ),
				);
			} );

			link.addEventListener( 'mouseenter', () => {
				$e.run(
					'app/load',
					{
						url: link.href,
					},
					systemEventMeta( {
						source: 'wp-admin-bar',
						trigger: 'mouse-hover',
					} ),
				);
			} );
		} );
	}
}

window.elementorAppLoader = new AppLoader();
