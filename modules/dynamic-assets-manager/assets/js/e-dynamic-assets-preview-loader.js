( function() {
	const cfg = 'undefined' === typeof elementorDynamicAssetsPreview ? null : elementorDynamicAssetsPreview;

	if ( ! cfg || ! cfg.assetMap ) {
		return;
	}

	const loadedHandles = new Set( cfg.serverLoadedHandles || [] );

	function selectorForHandle( handle ) {
		return '[data-e-lazy-asset="' + handle.replace( /"/g, '\\"' ) + '"]';
	}

	function isAlreadyInDom( handle ) {
		return !! document.querySelector( selectorForHandle( handle ) );
	}

	function collectRelevant( roots, kind ) {
		const relevant = new Set();
		const visit = ( h ) => {
			const node = cfg.assetMap[ h ];
			if ( ! node || node.kind !== kind || relevant.has( h ) ) {
				return;
			}
			relevant.add( h );
			( node.deps || [] ).forEach( visit );
		};
		( roots || [] ).forEach( visit );
		return relevant;
	}

	function topoSort( relevant ) {
		const nodes = Array.from( relevant );
		const inDegree = {};
		const children = {};

		nodes.forEach( ( h ) => {
			inDegree[ h ] = 0;
			children[ h ] = [];
		} );

		nodes.forEach( ( h ) => {
			const deps = ( cfg.assetMap[ h ] && cfg.assetMap[ h ].deps ) || [];
			deps.forEach( ( d ) => {
				if ( relevant.has( d ) ) {
					children[ d ].push( h );
					inDegree[ h ]++;
				}
			} );
		} );

		const queue = nodes.filter( ( h ) => 0 === inDegree[ h ] );
		const out = [];

		while ( queue.length ) {
			const h = queue.shift();
			out.push( h );
			children[ h ].forEach( ( n ) => {
				inDegree[ n ]--;
				if ( 0 === inDegree[ n ] ) {
					queue.push( n );
				}
			} );
		}

		if ( out.length !== nodes.length ) {
			return nodes;
		}

		return out;
	}

	function loadStyle( handle ) {
		const node = cfg.assetMap[ handle ];
		if ( ! node || node.kind !== 'style' ) {
			return Promise.resolve();
		}

		if ( loadedHandles.has( handle ) || isAlreadyInDom( handle ) ) {
			loadedHandles.add( handle );
			return Promise.resolve();
		}

		return new Promise( ( resolve ) => {
			const el = document.createElement( 'link' );

			el.rel = 'stylesheet';
			el.href = node.uri;
			el.setAttribute( 'data-e-lazy-asset', handle );
			el.onload = () => {
				loadedHandles.add( handle );
				resolve();
			};
			el.onerror = () => resolve();
			document.head.appendChild( el );
		} );
	}

	function loadScript( handle ) {
		const node = cfg.assetMap[ handle ];
		if ( ! node || node.kind !== 'script' ) {
			return Promise.resolve();
		}

		if ( loadedHandles.has( handle ) || isAlreadyInDom( handle ) ) {
			loadedHandles.add( handle );
			return Promise.resolve();
		}

		return new Promise( ( resolve ) => {
			const el = document.createElement( 'script' );

			el.src = node.uri;
			el.async = false;
			el.setAttribute( 'data-e-lazy-asset', handle );
			el.onload = () => {
				loadedHandles.add( handle );
				resolve();
			};
			el.onerror = () => resolve();
			document.body.appendChild( el );
		} );
	}

	function loadHandlesForWidgetType( widgetType ) {
		const graph = cfg.managedGraphs && cfg.managedGraphs[ widgetType ];

		if ( ! graph ) {
			return Promise.resolve();
		}

		const styleRelevant = collectRelevant( graph.styles || [], 'style' );
		const scriptRelevant = collectRelevant( graph.scripts || [], 'script' );
		const stylesOrder = topoSort( styleRelevant );
		const scriptsOrder = topoSort( scriptRelevant );

		return stylesOrder
			.reduce( ( chain, h ) => chain.then( () => loadStyle( h ) ), Promise.resolve() )
			.then( () => scriptsOrder.reduce( ( chain, h ) => chain.then( () => loadScript( h ) ), Promise.resolve() ) );
	}

	window.elementorDynamicAssetsLoader = {
		loadHandlesForWidgetType,
	};

	function onElementReadyGlobal( $scope ) {
		const elementType = $scope.attr( 'data-element_type' );

		if ( 'widget' !== elementType ) {
			return;
		}

		const widgetType = $scope.attr( 'data-widget_type' );

		if ( ! widgetType || ! cfg.managedWidgetTypes || -1 === cfg.managedWidgetTypes.indexOf( widgetType ) ) {
			return;
		}

		loadHandlesForWidgetType( widgetType );
	}

	jQuery( function() {
		if ( 'undefined' === typeof elementorFrontend || ! elementorFrontend.hooks ) {
			return;
		}

		elementorFrontend.hooks.addAction( 'frontend/element_ready/global', onElementReadyGlobal, 1 );
	} );
} )();
