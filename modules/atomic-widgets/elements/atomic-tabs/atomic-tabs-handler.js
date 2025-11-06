import { register } from '@elementor/frontend-handlers';

const SELECTED_CLASS = 'e--selected';

register( {
	elementType: 'e-tabs',
	uniqueId: 'e-tabs-handler',
	callback: ( { element, signal, settings } ) => {
		const tabs = element.querySelectorAll( '[data-element_type="e-tab"]' );
		const tabPanels = element.querySelectorAll( '[data-element_type="e-tab-content"]' );

		const setActiveTab = ( id ) => {
			tabs.forEach( ( tab ) => {
				if ( tab.getAttribute( 'data-id' ) === id ) {
					tab.classList.add( SELECTED_CLASS );
					tab.setAttribute( 'aria-selected', 'true' );
					return;
				}

				tab.classList.remove( SELECTED_CLASS );
				tab.setAttribute( 'aria-selected', 'false' );
			} );

			tabPanels.forEach( ( tabPanel ) => {
				const activeTab = tabPanel.getAttribute( 'data-tab-id' ) === id;

				if ( activeTab ) {
					tabPanel.style.removeProperty( 'display' );
					tabPanel.removeAttribute( 'hidden' );
					// Add the selected class after the display property is removed so the transition animation is applied
					requestAnimationFrame( () => {
						tabPanel.classList.add( SELECTED_CLASS );
					}, 0 );

					return;
				}

				tabPanel.classList.remove( SELECTED_CLASS );

				tabPanel.style.display = 'none';
				tabPanel.setAttribute( 'hidden', 'true' );
			} );
		};

		const defaultActiveTab = settings[ 'default-active-tab' ];

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
