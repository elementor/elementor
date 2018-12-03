export default class extends Marionette.LayoutView {
	id() {
		return 'elementor-icons-manager';
	}

	cache() {
		return {};
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
		ui.tabLi = '.icon-type-tab-label';
		ui.iconListContainer = '.elementor-icon-manager-tabs-content';
		// ui.iconListItems = '';

		return ui;
	}

	isInCache( name ) {
		return ( this.cache[ name ] );
	}

	showTab( event ) {
		const $tab = jQuery( event.target ),
			tabKey = $tab.attr( 'data-tab' ),
			tabSettings = JSON.parse( $tab.attr( 'data-settings' ) );
		if ( ! this.isInCache( tabKey ) ) {
			this.initIconType( tabSettings );
		}

		this.ui.tabLi.removeClass( 'active' );

		const icons = this.store().getIcons( tabSettings );
		if ( ! icons ) {
			return;
		}
		$tab.addClass( 'active' );
		this.ui.iconListContainer.html( '' );
		for ( const i in icons ) {
			const icon = icons[ i ],
				iconLi = document.createElement( 'li' ),
				clss = icon.displayPrefix + ' ' + icon.selector + ' ' + 'icon-list-item';
			iconLi.setAttribute( 'data-name', icon.name );

			iconLi.innerHTML = '<i class="' + clss + '" data-name="' + icon.name + '" data-value="' + icon.displayPrefix + ' ' + icon.selector + '"></i>' + '<span>' + icon.name + '</span>';

			this.ui.iconListContainer.append( iconLi );
		}
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
		this.store().save( library );
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
			library.icons = data.icons;
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
		this.store().save( library );
		this.initIconType( library );
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
		if ( this.store().isValid( libraryConfig ) ) {
			return;
		}

		// comes with icons
		if ( libraryConfig.icons && libraryConfig.icons.length ) {
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
			getKey( library ) {
				return '_elementor_' + library.name + '_icons';
			},
			save( library ) {
				this.set( this.getKey( library ), library );
			},
			getIcons( library ) {
				const data = this.get( this.getKey( library ) );
				if ( data && data.icons ) {
					return data.icons;
				}
				return false;
			},
			set( key, value ) {
				const preparedValue = JSON.stringify( value );
				window.localStorage.setItem( key, preparedValue );
			},
			get( key ) {
				const saved = window.localStorage.getItem( key );
				if ( ! saved ) {
					return false;
				}
				return JSON.parse( saved );
			},
			isValid( library ) {
				const saved = this.get( this.getKey( library ) );
				if ( ! saved ) {
					return false;
				}
				if ( saved.ver !== library.ver ) {
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
