import { render } from 'react-dom';
import domReady from '@wordpress/dom-ready';
import { ThemeProvider, DirectionProvider } from '@elementor/ui';

import { App } from './app';

const injectStylesIntoShadow = ( shadowRoot ) => {
	const injectStyleSheet = ( styleSheet ) => {
		try {
			if ( styleSheet.href ) {
				const linkElement = document.createElement( 'link' );
				linkElement.rel = 'stylesheet';
				linkElement.href = styleSheet.href;
				shadowRoot.appendChild( linkElement );
			} else {
				const rules = Array.from( styleSheet.cssRules || [] );
				if ( rules.length > 0 ) {
					const styleElement = document.createElement( 'style' );
					rules.forEach( ( rule ) => {
						styleElement.textContent += rule.cssText + '\n';
					} );
					shadowRoot.appendChild( styleElement );
				}
			}
		} catch ( e ) {
			if ( styleSheet.href ) {
				const linkElement = document.createElement( 'link' );
				linkElement.rel = 'stylesheet';
				linkElement.href = styleSheet.href;
				shadowRoot.appendChild( linkElement );
			}
		}
	};

	const styleSheets = Array.from( document.styleSheets );
	
	styleSheets.forEach( ( styleSheet ) => {
		const ownerNode = styleSheet.ownerNode;
		if ( ! ownerNode ) {
			return;
		}

		const isElementorStyle = ownerNode.id?.includes( 'elementor' ) ||
			ownerNode.className?.includes( 'elementor' ) ||
			styleSheet.href?.includes( 'elementor' ) ||
			ownerNode.href?.includes( 'elementor' );

		if ( isElementorStyle || ownerNode.tagName === 'STYLE' ) {
			injectStyleSheet( styleSheet );
		} else if ( ownerNode.tagName === 'LINK' && ownerNode.rel === 'stylesheet' ) {
			const href = ownerNode.href || styleSheet.href;
			if ( href && ( href.includes( 'mui' ) || href.includes( 'material' ) || href.includes( 'elementor' ) ) ) {
				injectStyleSheet( styleSheet );
			}
		}
	} );

	const styleElements = document.querySelectorAll( 'style[data-emotion], style[id*="mui"], style[id*="elementor"]' );
	styleElements.forEach( ( styleEl ) => {
		const clonedStyle = styleEl.cloneNode( true );
		shadowRoot.appendChild( clonedStyle );
	} );
};

const initializeApp = () => {
	const rootElement = document.getElementById( 'elementor-css-converter-root' );

	if ( ! rootElement ) {
		return;
	}

	const isRTL = elementorCommon?.config?.isRTL || false;

	if ( rootElement.attachShadow ) {
		const shadowRoot = rootElement.attachShadow( { mode: 'open' } );
		const shadowContainer = document.createElement( 'div' );
		shadowRoot.appendChild( shadowContainer );

		injectStylesIntoShadow( shadowRoot );

		setTimeout( () => {
			injectStylesIntoShadow( shadowRoot );
		}, 100 );

		setTimeout( () => {
			injectStylesIntoShadow( shadowRoot );
		}, 500 );

		window.addEventListener( 'load', () => {
			injectStylesIntoShadow( shadowRoot );
		} );

		const styleObserver = new MutationObserver( () => {
			injectStylesIntoShadow( shadowRoot );
		} );

		styleObserver.observe( document.head, {
			childList: true,
			subtree: true,
		} );

		render(
			<DirectionProvider rtl={ isRTL }>
				<ThemeProvider colorScheme="light">
					<App />
				</ThemeProvider>
			</DirectionProvider>,
			shadowContainer
		);
	} else {
		render(
			<DirectionProvider rtl={ isRTL }>
				<ThemeProvider colorScheme="light">
					<App />
				</ThemeProvider>
			</DirectionProvider>,
			rootElement
		);
	}
};

domReady( () => {
	initializeApp();
} );

window.addEventListener( 'load', () => {
	const rootElement = document.getElementById( 'elementor-css-converter-root' );
	if ( rootElement && rootElement.shadowRoot ) {
		injectStylesIntoShadow( rootElement.shadowRoot );
	}
} );

