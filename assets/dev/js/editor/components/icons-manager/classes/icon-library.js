import Store from './store';

const IconLibrary = class {
	notifyCallback = null;

	enqueueCSS = url => {
		return new Promise( function ( resolve ) {
			if ( ! document.querySelector( 'link[href="' + url + '"]' ) ) {
				const link = document.createElement( 'link' );
				link.type = 'text/css';
				link.rel = 'stylesheet';
				link.href = url;
				link.onload = function () {
					resolve();
				};
				const headScript = document.querySelector( 'head' );
				headScript.append( link );
			}
		} );
	};

	parseCSS = ( css, prefix = 'fa-', displayPrefix = '', library = false ) => {
		const iconPattern = new RegExp( "\\." +	prefix + "([^\\.!:]*)::?before\\s*{\\s*content:\\s*[\"|']\\\\[^'|\"]*[\"|'];?\\s*}", "g" ),
			index = 1,
			icons = [];
		let icon,
			match = iconPattern.exec( css );

		while ( match ) {
			icon = {
				prefix: prefix,
				selector: prefix + match[ index ].trim( ':' ),
				name: this.ucwords( match[ index ] )
					.trim( ':' )
					.split( '-' )
					.join( ' ' ),
				filter: match[ index ].trim( ':' ),
				displayPrefix: displayPrefix || prefix.replace( '-', '' )
			};
			icons.push( { [ match[ index ] ]: icon } );
			match = iconPattern.exec( css );
		}

		if ( ! library ) {
			return icons;
		}
		return this.normalizeIconList( { ... library, icons: icons } );
	};

	extractIconsFromCSS = library => {
		fetch( library.url, { mode: 'cors' } )
			.then( res => { return res.text(); } )
			.then( css => {
				this.parseCSS( css, library.prefix, library.displayPrefix || '', library );
			} );
	};

	fetchIcons = library => {
		fetch( library.fetchJson, { mode: 'cors' } )
			.then( res => {
				return res.json();
			} )
			.then( json => {
				library.icons = json.icons;
				return this.normalizeIconList( library );
			} );
	};

	normalizeIconList( library ) {
		const icons = {};
		let icon, name;
		for ( icon in library.icons ) {
			if ( ! library.icons.hasOwnProperty( icon ) ) {
				continue;
			}
			name = library.icons[ icon ];
			if ( 'object' === typeof name ) {
				name = Object.entries( name )[ 0 ][ 0 ];
			}
			icons[ name ] = {
				prefix: library.prefix,
				selector: library.prefix + name.trim( ':' ),
				name: this.ucwords( name )
					.trim( ':' )
					.split( '-' )
					.join( ' ' ),
				filter: name.trim( ':' ),
				displayPrefix:
					library.displayPrefix || library.prefix.replace( '-', '' )
			};
		}
		if ( Object.keys( icons ).length ) {
			library.icons = icons;
			Store.save( library );
			this.notifyCallback( library );
		}
	}

	initIconType = ( libraryConfig, callback ) => {
		this.notifyCallback = callback;
		// Enqueue CSS
		if ( libraryConfig.enqueue ) {
			libraryConfig.enqueue.forEach( assetURL => {
				this.enqueueCSS( assetURL );
			} );
		}

		if ( libraryConfig.url ) {
			this.enqueueCSS( libraryConfig.url );
		}

		//already saved an stored
		if ( Store.isValid( libraryConfig ) ) {
			const data = Store.get( Store.getKey( libraryConfig ) );
			return this.normalizeIconList( data );
		}

		// comes with icons
		if ( libraryConfig.icons && libraryConfig.icons.length ) {
			return this.normalizeIconList( libraryConfig );
		}

		// Get icons from via ajax
		if ( libraryConfig.fetchJson ) {
			return this.fetchIcons( libraryConfig );
		}

		// try parsing CSS
		if ( libraryConfig.url ) {
			this.extractIconsFromCSS( libraryConfig );
		}
	};

	ucwords( str ) {
		return ( str + '' ).replace( /^(.)|\s+(.)/g, function ( $1 ) {
			return $1.toUpperCase();
		} );
	}
};

export default new IconLibrary();
