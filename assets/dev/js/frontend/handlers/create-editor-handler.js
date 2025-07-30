export function createEditorHandler( importer ) {
	return () => {
		return new Promise( ( resolve ) => {
			if ( elementorFrontend.isEditMode() ) {
				importer().then( resolve );
			}
		} );
	};
}
