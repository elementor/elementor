import { render } from 'react-dom';
import domReady from '@wordpress/dom-ready';
import { ThemeProvider, DirectionProvider } from '@elementor/ui';

import { App } from './app';

const injectStylesIntoShadow = ( shadowRoot ) => {
	const injectedStyleIds = new Set();

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

	const styleElements = document.querySelectorAll( 'style[data-emotion], style[id*="mui"], style[id*="elementor"], style[id*="emotion"]' );
	styleElements.forEach( ( styleEl ) => {
		const styleId = styleEl.id || styleEl.getAttribute( 'data-emotion' ) || styleEl.textContent?.substring( 0, 50 );
		if ( styleId && ! injectedStyleIds.has( styleId ) ) {
			const clonedStyle = styleEl.cloneNode( true );
			shadowRoot.appendChild( clonedStyle );
			injectedStyleIds.add( styleId );
		}
	} );

	const allStyleElements = document.querySelectorAll( 'style' );
	allStyleElements.forEach( ( styleEl ) => {
		const styleId = styleEl.id || styleEl.getAttribute( 'data-emotion' ) || styleEl.textContent?.substring( 0, 50 );
		if ( styleId && ! injectedStyleIds.has( styleId ) ) {
			const textContent = styleEl.textContent || '';
			if ( textContent.includes( 'Mui' ) || textContent.includes( 'eui-' ) || styleEl.id?.includes( 'emotion' ) ) {
				const clonedStyle = styleEl.cloneNode( true );
				shadowRoot.appendChild( clonedStyle );
				injectedStyleIds.add( styleId );
			}
		}
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

		const scheduleStyleInjection = () => {
			injectStylesIntoShadow( shadowRoot );
		};

		scheduleStyleInjection();

		setTimeout( scheduleStyleInjection, 100 );
		setTimeout( scheduleStyleInjection, 500 );
		setTimeout( scheduleStyleInjection, 1000 );
		setTimeout( scheduleStyleInjection, 2000 );

		window.addEventListener( 'load', scheduleStyleInjection );

		const styleObserver = new MutationObserver( () => {
			scheduleStyleInjection();
		} );

		styleObserver.observe( document.head, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [ 'id', 'data-emotion' ],
		} );

		styleObserver.observe( document.body, {
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

		requestAnimationFrame( () => {
			scheduleStyleInjection();
		} );
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

