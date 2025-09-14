import { register } from '@elementor/frontend-handlers';

register( {
	elementType: 'e-tabs',
	uniqueId: 'e-tabs-handler',
	callback: ( { element, signal } ) => {
		const tabs = element.querySelectorAll( '[data-element_type="e-tab"]' );
		const tabPanels = element.querySelectorAll( '[data-element_type="e-tab-panel"]' );

		const setActiveTab = ( id ) => {
			tabPanels.forEach( ( tabPanel ) => {
				tabPanel.style.display = 'none';
				tabPanel.setAttribute( 'hidden', 'true' );

				if ( tabPanel.getAttribute( 'aria-labelledby' ) === id ) {
					tabPanel.style.display = '';
					tabPanel.removeAttribute( 'hidden' );
				}
			} );
		};

		const defaultActiveTab = element.getAttribute( 'default-active-tab' );

		setActiveTab( defaultActiveTab );

		tabs.forEach( ( tab ) => {
			const clickHandler = () => {
				const tabId = tab.getAttribute( 'data-id' );
				setActiveTab( tabId );
			};

			tab.addEventListener( 'click', clickHandler, { signal } );
		} );
	},
} );
