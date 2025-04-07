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

			this.injectStylesOnce();

			this.appManager.mount( chipElement, {
				wrapperElement: '.elementor-panel-category-title',
				reactAnchor: '.e-promotion-react-wrapper',
			} );
		} );
	}

	injectStylesOnce() {
		const existing = document.getElementById( 'popover-chip-tooltip-style' );

		if ( existing ) {
			return;
		}

		const style = document.createElement( 'style' );

		style.id = 'popover-chip-tooltip-style';
		style.innerHTML = `
				.e-popover-infotip .MuiTooltip-tooltip {
					border-radius: 8px;
				}
			`;

		document.head.appendChild( style );
	}
}

new AlphaChipApp();
