export default class {
	loaded = {};

	notifyCallback = null;

	fetchIcons = ( library ) => {
		fetch( library.fetchJson, { mode: 'cors' } )
			.then( ( res ) => {
				return res.json();
			} )
			.then( ( json ) => {
				library.icons = json.icons;
				return this.normalizeIconList( library );
			} );
	};

	normalizeIconList( library ) {
		const icons = {};
		let name;

		jQuery.each( library.icons, ( index, icon ) => {
			name = icon;
			if ( 'object' === typeof name ) {
				name = Object.entries( name )[ 0 ][ 0 ];
			}
			if ( ! name ) {
				return;
			}
			icons[ name ] = {
				prefix: library.prefix,
				selector: library.prefix + name.trim( ':' ),
				name: elementorCommon.helpers.upperCaseWords( name )
					.trim( ':' )
					.split( '-' )
					.join( ' ' ),
				filter: name.trim( ':' ),
				displayPrefix: library.displayPrefix || library.prefix.replace( '-', '' ),
			};
		} );

		if ( Object.keys( icons ).length ) {
			library.icons = icons;
			this.loaded[ library.name ] = true;
			elementor.iconManager.store.save( library );
			this.runCallback( library );
		}
	}

	runCallback = ( library ) => {
		if ( 'function' !== typeof this.notifyCallback ) {
			return library;
		}
		return this.notifyCallback( library );
	};

	initIconType = ( libraryConfig, callback ) => {
		this.notifyCallback = callback;
		const store = elementor.iconManager.store;

		if ( this.loaded[ libraryConfig.name ] ) {
			libraryConfig.icons = store.getIcons( libraryConfig );
			return this.runCallback( libraryConfig );
		}

		// Enqueue CSS
		if ( libraryConfig.enqueue ) {
			libraryConfig.enqueue.forEach( ( assetURL ) => {
				const versionAddedURL = `${ assetURL }${ libraryConfig?.ver ? '?ver=' + libraryConfig.ver : '' }`;
				elementor.helpers.enqueueEditorStylesheet( versionAddedURL );
			} );
		}

		if ( libraryConfig.url ) {
			const versionAddedURL = `${ libraryConfig.url }${ libraryConfig?.ver ? '?ver=' + libraryConfig.ver : '' }`;
			elementor.helpers.enqueueEditorStylesheet( versionAddedURL );
		}

		// Already saved an stored
		if ( store.isValid( libraryConfig ) ) {
			const data = store.get( store.getKey( libraryConfig ) );
			return this.normalizeIconList( data );
		}

		// Comes with icons
		if ( libraryConfig.icons && libraryConfig.icons.length ) {
			return this.normalizeIconList( libraryConfig );
		}

		// Get icons from via ajax
		if ( libraryConfig.fetchJson ) {
			return this.fetchIcons( libraryConfig );
		}
		// @todo: error handling
	};
}

