export default class extends Marionette.ItemView {
	id() {
		return 'elementor-icons-manager';
	}

	cache() {
		return {
			value: '',
			type: '',
			icons: false,
		};
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
		return {
			tabLabel: '.icon-type-tab-label',
			searchInput: '#icons-search',
			iconValueInput: '#icon_value',
			iconTypeInput: '#icon_type',
			tabLi: '.icon-type-tab-label',
			iconListContainer: '.elementor-icon-manager-tabs-content',
			iconListItems: '.icon-list-item',
			iconListItem: '.icon-list-item i',
		};
	}

	events() {
		return {
			'click @ui.tabLabel': 'onTabClick',
			'click @ui.iconListItems': 'onIconClick',
			'click @ui.iconListItem': 'onIconClick',
			'input @ui.searchInput': 'onSearch',
		};
	}

	isInCache( name ) {
		return ( this.cache[ name ] );
	}

	toggleSearchBarVisibility( state ) {
		return state ? this.ui.searchInput.show() : this.ui.searchInput.hide();
	}

	onTabClick( event ) {
		this.showTab( jQuery( event.target ).attr( 'data-tab' ) );
	}

	showTab( tabKey ) {
		const tabSettings = ElementorConfig.icons[ tabKey ];

		tabSettings.name = tabKey;

		if ( ! this.isInCache( tabKey ) ) {
			this.initIconType( tabSettings );
			this.cache[ tabKey ] = true;
		}

		this.ui.tabLi.removeClass( 'active' );

		const icons = this.store().getIcons( tabSettings );
		if ( ! icons ) {
			return;
		}
		this.cache.type = tabKey;
		jQuery( 'li[data-tab="' + tabKey + '"]' ).addClass( 'active' );
		this.ui.iconListContainer.html( '' );
		for ( const i in icons ) {
			const icon = icons[ i ];

			if ( this.cache.icons ) {
				if ( this.cache.icons.include && this.cache.icons.include[ tabKey ] && -1 === this.cache.icons.include[ tabKey ].indexOf( icon.filter ) ) {
					continue;
				}

				if ( this.cache.icons.exclude && -1 !== this.cache.icons.exclude.indexOf( icon.filter ) ) {
					continue;
				}
			}

			const iconLi = jQuery( '<li>' ),
				iTag = jQuery( '<i>' ),
				clss = icon.displayPrefix + ' ' + icon.selector;

			iconLi.addClass( 'icon-list-item' );
			iconLi.attr( 'data-name', icon.name );

			iTag.addClass( clss )
				.data( 'name', icon.name )
				.data( 'value', icon.displayPrefix + ' ' + icon.selector )
				.html( '<span>' + icon.name + '</span>' );

			iconLi.append( iTag );

			this.ui.iconListContainer.append( iconLi );
		}
	}

	showAll() {
		this.ui.iconListItems.show();
	}

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

	removeSelectedIconClass() {
		jQuery( '.icon-list-item.selected' ).removeClass( 'selected' );
	}

	showAllTabs() {
		this.ui.tabLi.show();
	}

	hideAllTabs() {
		this.ui.tabLi.hide();
	}

	hideTabByName( name ) {
		_.each( this.ui.tabLi, ( tab ) => {
			if ( name === jQuery( tab ).data( 'tab' ) ) {
				jQuery( tab ).hide();
			}
		} );
	}

	showTabByName( name ) {
		_.each( this.ui.tabLi, ( tab ) => {
			if ( name === jQuery( tab ).data( 'tab' ) ) {
				jQuery( tab ).show();
			}
		} );
	}

	onIconClick( event ) {
		const $iconLi = 'LI' === event.target.tagName ? jQuery( event.target ) : jQuery( event.target ).parent();
		this.setSelected( $iconLi );
	}

	setSelected( $iconLi ) {
		this.removeSelectedIconClass();
		$iconLi.addClass( 'selected' );
		const $icon = $iconLi.find( 'i' );
		this.cache.value = $icon.data( 'value' );
	}

	onSearch() {
		let filter = this.ui.searchInput.val();

		if ( '' === filter ) {
			return this.showAll();
		}

		filter = filter.toLocaleLowerCase();
		jQuery( this.ui.iconListItems.selector ).each( ( index, iconLi ) => {
			const $iconLi = jQuery( iconLi );
			if ( $iconLi.data( 'name' ).toLocaleLowerCase().indexOf( filter ) < 0 ) {
				$iconLi.hide();
			} else {
				$iconLi.show();
			}
		} );
	}

	reset() {
		this.showAllTabs();
		this.cache.value = '';
		this.cache.type = '';
		this.cache.icons = false;
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
