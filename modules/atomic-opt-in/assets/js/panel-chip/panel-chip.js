import { AppManager } from './app-manager';

class AlphaChipApp {
	constructor() {
		this.appManager = new AppManager();
		this.initializeListener();
	}

	initializeListener() {
		document.addEventListener( 'alphachip:open', ( event ) => {
			const targetElement = event.detail.target;
			const chipElement = targetElement?.find( '.elementor-panel-heading-category-chip' )[ 0 ];

			if ( ! chipElement ) {
				return;
			}

			this.appManager.mount( chipElement, {
				wrapperElement: '.elementor-panel-category-title',
				reactAnchor: '.e-promotion-react-wrapper',
			} );
		} );
	}
}

new AlphaChipApp();
