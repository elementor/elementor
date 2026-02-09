
registerElementorElement( {
	elementType: 'v4-tabs',
	id: 'v4-tabs-handler',
	callback( { element, listenToChildren } ) {
		const IS_EDITOR_MODE = !! window.parent?.elementorV2?.editorComponents;
		const IS_INITIALIZED = element.hasAttribute( 'x-initialized' );
		if ( IS_INITIALIZED ) {
			return;
		}
		element.setAttribute( 'x-initialized', 'true' );
		element.addEventListener( 'elementor/element/rendered', () => {
			const notElementOverlay = ( el ) => {
				return ! el.classList.contains( 'elementor-element-overlay' );
			};

			let activeTab = parseInt( element.dataset.activeTab );
			if ( isNaN( activeTab ) ) {
				activeTab = 0;
			}

			const template = element.querySelector( 'template' );
			const slot = template ? template.content.querySelector( 'slot' ) : element.querySelector( 'slot[name="tabs-content-area"]' );
			if ( IS_EDITOR_MODE && template ) {
				element.replaceChild( slot, template );
			}
			const contentContainer = Array.from( slot.children )[ 0 ];
			const triggerContainer = Array.from( element.querySelector( 'slot[name="tabs-menu"]' ).children )[ 0 ];

			const triggerElements = Array.from( triggerContainer?.children || [] ).filter( notElementOverlay );
			const contentElements = Array.from( contentContainer?.children || [] ).filter( notElementOverlay );

			const contentArea = element.querySelector( 'div[data-role="tabs-content"]' );

			const arrange = () => {
				if ( IS_EDITOR_MODE ) {
					contentElements.forEach( ( contentElement, idx ) => {
						if ( ! contentElement.hasAttribute( 'x-display' ) && contentElement.style.display ) {
							contentElement.setAttribute( 'x-display', contentElement.style.display );
						}
						if ( idx !== activeTab ) {
							contentElement.style.display = 'none';
						} else {
							contentElement.style.display = contentElement.getAttribute( 'x-display' ) || null;
						}
					} );
					return;
				}
				const empty = document.createElement( 'empty' );
				/** @type {HTMLElement} */
				const newContent = contentElements[ activeTab ] || empty;
				const clone = newContent.cloneNode( newContent, true );
				contentArea.replaceChildren( clone );
				template?.remove();
			};

			triggerElements.forEach( ( triggerElement, index ) => {
				triggerElement.onclick = () => {
					activeTab = index;
					arrange();
				};
			} );

			arrange();
			listenToChildren( [ 'e-flexbox', 'e-div-block' ] )
				.render( () => {
					window.parent?.$e?.run( 'document/elements/deselect-all' );

					arrange();
				} );
		} );
	},
} );
