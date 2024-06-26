class LinkInBioLibraryModule extends elementorModules.editor.utils.Module {
	onElementorInit() {
		elementor.hooks.addFilter( 'elementor/editor/template-library/template/promotion-link', ( url, templateData ) => {
			const { subtype } = templateData;
			if ( 'Link in Bio' === subtype ) {
				try {
					const urlPieces = new URL( url );
					const searchParams = new URLSearchParams();
					urlPieces.searchParams.forEach( ( value, key ) => {
						if ( 'utm_source' === key ) {
							searchParams.set( key, 'template-library-link-in-bio' );
						} else {
							searchParams.set( key, value );
						}
					} );
					return `${ urlPieces.origin }${ urlPieces.pathname }?${ searchParams.toString() }`;
				} catch ( e ) {
					return url;
				}
			}
			return url;
		}, 1000 );
	}
}

export default LinkInBioLibraryModule;
