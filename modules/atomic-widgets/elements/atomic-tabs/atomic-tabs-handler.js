import { register } from '@elementor/frontend-handlers';

register( {
	elementType: 'e-tabs',
	uniqueId: 'e-tabs-handler',
	callback: ( { element, signal } ) => {
		const tabs = element.querySelectorAll( '[data-element_type="e-tab"]' );
		const tabPanels = element.querySelectorAll( '[data-element_type="e-tab-panel"]' );

		tabs.forEach( ( tab, index ) => {
			const clickHandler = () => {
				tabPanels.forEach( ( tabPanel ) => {
					tabPanel.style.display = 'none';
				} );
				tabPanels[ index ].style.display = 'block';
			};

			tab.addEventListener( 'click', clickHandler, { signal } );
		} );
	},
} );
