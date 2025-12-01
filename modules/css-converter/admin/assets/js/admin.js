import { render } from 'react-dom';
import domReady from '@wordpress/dom-ready';
import { ThemeProvider, DirectionProvider } from '@elementor/ui';

import { App } from './app';

const injectStylesIntoShadow = ( shadowRoot ) => {
	const injectedStyleIds = new Set();
	const injectedStyleHashes = new Set();

	const getStyleIdentifier = ( styleEl ) => {
		return styleEl.id || 
			styleEl.getAttribute( 'data-emotion' ) || 
			styleEl.getAttribute( 'data-s' ) ||
			styleEl.textContent?.substring( 0, 100 ) ||
			'';
	};

	const getStyleHash = ( textContent ) => {
		if ( ! textContent ) return '';
		let hash = 0;
		for ( let i = 0; i < Math.min( textContent.length, 200 ); i++ ) {
			const char = textContent.charCodeAt( i );
			hash = ( ( hash << 5 ) - hash ) + char;
			hash = hash & hash;
		}
		return hash.toString();
	};

	const injectStyleElement = ( styleEl ) => {
		const styleId = getStyleIdentifier( styleEl );
		const textContent = styleEl.textContent || '';
		const styleHash = getStyleHash( textContent );

		if ( ! styleId && ! textContent ) {
			return;
		}

		if ( injectedStyleIds.has( styleId ) || injectedStyleHashes.has( styleHash ) ) {
			return;
		}

		const isMuiStyle = textContent.includes( 'Mui' ) || 
			textContent.includes( 'eui-' ) || 
			styleEl.id?.includes( 'emotion' ) ||
			styleEl.getAttribute( 'data-emotion' ) ||
			styleEl.getAttribute( 'data-s' ) ||
			styleEl.id?.includes( 'mui' );

		if ( isMuiStyle || styleId ) {
			const clonedStyle = styleEl.cloneNode( true );
			shadowRoot.appendChild( clonedStyle );
			if ( styleId ) {
				injectedStyleIds.add( styleId );
			}
			if ( styleHash ) {
				injectedStyleHashes.add( styleHash );
			}
		}
	};

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

	const allStyleElements = document.querySelectorAll( 'style' );
	allStyleElements.forEach( injectStyleElement );

	if ( typeof elementorV2 !== 'undefined' && elementorV2?.ui ) {
		try {
			const emotionCache = elementorV2.ui.__emotion_cache || 
				elementorV2.ui.cache ||
				( window.__EMOTION_CACHE__ );
			
			if ( emotionCache && emotionCache.sheet ) {
				const emotionStyles = emotionCache.sheet.tags || [];
				emotionStyles.forEach( ( tag ) => {
					if ( tag && tag.textContent ) {
						const styleEl = document.createElement( 'style' );
						styleEl.textContent = tag.textContent;
						injectStyleElement( styleEl );
					}
				} );
			}
		} catch ( e ) {
		}
	}
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

		setTimeout( scheduleStyleInjection, 50 );
		setTimeout( scheduleStyleInjection, 100 );
		setTimeout( scheduleStyleInjection, 250 );
		setTimeout( scheduleStyleInjection, 500 );
		setTimeout( scheduleStyleInjection, 1000 );
		setTimeout( scheduleStyleInjection, 2000 );
		setTimeout( scheduleStyleInjection, 3000 );

		window.addEventListener( 'load', scheduleStyleInjection );

		const styleObserver = new MutationObserver( () => {
			scheduleStyleInjection();
		} );

		styleObserver.observe( document.head, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [ 'id', 'data-emotion', 'data-s' ],
		} );

		styleObserver.observe( document.body, {
			childList: true,
			subtree: true,
		} );

		const continuousInterval = setInterval( () => {
			scheduleStyleInjection();
		}, 500 );

		setTimeout( () => {
			clearInterval( continuousInterval );
		}, 10000 );

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
			requestAnimationFrame( scheduleStyleInjection );
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

