export default class extends Marionette.LayoutView {
	id() {
		return 'elementor-icons-manager';
	}

	getTemplate() {
		return '#tmpl-elementor-icons-manager';
	}

	getDefaultSettings() {
		return {
			name: '',
			url: '',
			prefix: '',
			displayPrefix: '',
			ver: '',
			enqueue: [],
			exclude: [],
			include: [],
			icons: [],
			fetchJson: false,
		};
	}

	iconTypes() {
		return [];
	}

	ui() {
		const ui = {};
		ui.tabLabel = '.icon-type-tab-label';
		ui.searchInput = '.icons-search';
		// ui.iconList = '';
		// ui.iconListItems = '';

		return ui;
	}

	showTab() {
		console.log( arguments, this );
	}

	// onSearch() {
	// 	const input = this.ui.searchInput,
	// 		value = input.value;
	//
	// 	if ( '' === value ) {
	// 		return this.showAll();
	// 	}
	//
	// 	return this.filterIcons( value );
	// }
	enqueueCSS( url ) {
		return new Promise( function( resolve ) {
			if ( ! document.querySelector( 'link[href="' + url + '"]' ) ) {
				const link = document.createElement( 'link' );
				link.type = 'text/css';
				link.rel = 'stylesheet';
				link.href = url;
				link.onload = function() {
					resolve();
				};
				const headScript = document.querySelector( 'head' );
				headScript.append( link );
			}
		} );
	}

	parseCSS( css, prefix = 'fa-', displayPrefix = '', library = false ) {
		const iconPattern = new RegExp( '\\.' + prefix + '([^\\.!:]*)::?before\\s*{\\s*content:\\s*["|\']\\\\[^\'|"]*["|\'];?\\s*}', 'g' ),
			index = 1,
			icons = {};
		let icon,
			match = iconPattern.exec( css );

		while ( match ) {
			icon = {
				prefix: prefix,
				selector: prefix + match[ index ].trim( ':' ),
				name: this.ucwords( match[ index ] ).trim( ':' ).split( '-' ).join( ' ' ),
				filter: match[ index ].trim( ':' ),
				displayPrefix: ( displayPrefix || prefix.replace( '-', '' ) ),
			};
			icons[ match[ index ] ] = icon;
			match = iconPattern.exec( css );
		}

		if ( ! library ) {
			return icons;
		}

		library.icons = icons;
		this.Icons[ library.name ] = icons;
		this.store.save( library );
	}

	extractIconsFromCSS( library ) {
		fetch( library.url, { mode: 'cors' } ).then( ( res ) => {
			return res.text();
		} ).then( ( css ) => {
			this.parseCSS( css, library.prefix, library.displayPrefix || '', library );
		} );
	}

	fetchIcons( library ) {
		jQuery.getJSON( library.fetchJson, ( data ) => {
			library.icons = data;
			return this.normalizeIconList( library );
		} );
	}

	normalizeIconList( library ) {
		const icons = {};
		let icon,
			name;
		for ( icon in library.icons ) {
			name = library.icons[ icon ];
			icons[ name ] = {
				prefix: library.prefix,
				selector: library.prefix + name.trim( ':' ),
				name: this.ucwords( name ).trim( ':' ).split( '-' ).join( ' ' ),
				filter: name.trim( ':' ),
				displayPrefix: ( library.displayPrefix || library.prefix.replace( '-', '' ) ),
			};
		}
		library.icons = icons;
		this.Icons[ library.name ] = icons;
		return this.store.save( library );
	}

	addIconType( config ) {
		const exists = this.iconTypes.filter( ( conf ) => conf.name === config.name );
		if ( exists.length ) {
			return;
		}
		this.iconTypes.push( Object.assign( this.getDefaultSettings(), config ) );
	}

	ucwords( str ) {
		return ( str + '' ).replace( /^(.)|\s+(.)/g, function( $1 ) {
			return $1.toUpperCase();
		} );
	}

	initIconType( libraryConfig ) {
		// Enqueue CSS
		if ( libraryConfig.enqueue ) {
			libraryConfig.enqueue.forEach( ( assetURL ) => {
				this.enqueueCSS( assetURL );
			} );
		}

		if ( libraryConfig.url ) {
			this.enqueueCSS( libraryConfig.url );
		}

		// already saved an stored
		if ( this.store.isValid( libraryConfig ) ) {
			return;
		}

		// comes with icons
		if ( libraryConfig.icons.length ) {
			return this.normalizeIconList( libraryConfig );
		}

		// Get icons from via ajax
		if ( libraryConfig.fetchJson ) {
			return this.fetchIcons( libraryConfig );
		}

		// try pharsing CSS
		this.extractIconsFromCSS( libraryConfig );
	}

	events() {
		return {
			'click @ui.tabLabel': 'showTab',
		};
	}

	store() {
		return {
			save( iconLibrary ) {
				const storageKey = iconLibrary.name + '_icons';
				this.set( storageKey, iconLibrary );
			},
			set( key, value ) {
				const preparedValue = JSON.stringify( value );
				window.localStorage.setItem( key, preparedValue );
			},
			getIcons( name ) {
				return this.get( name + '_icons' );
			},
			get( key ) {
				const saved = window.localStorage.getItem( key );
				if ( ! saved ) {
					return false;
				}
				return JSON.parse( saved );
			},
			isValid( iconLibrary ) {
				const saved = this.get( iconLibrary.name + '_icons' );
				if ( ! saved ) {
					return false;
				}
				if ( saved.ver !== iconLibrary.ver ) {
					return false;
				}
				return true;
			},
			del( key ) {
				window.localStorage.removeItem( key );
			},
		};
	}
}
