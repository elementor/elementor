export const appsEventTrackingDispatch = ( command, eventParams ) => {
	// Name modifications in eventParams object.
	const keyRename = ( obj, oldKey, newKey ) => {
		delete Object.assign( obj, { [ newKey ]: obj[ oldKey ] } )[ oldKey ];
	}

	// Add existing eventParams key value pair to the data object.
	const objectCreator = ( array, obj ) => {
		for ( const key of array ) {
			if ( eventParams.hasOwnProperty( key ) && eventParams[ key ] !== null ) {
				obj[ key ] = eventParams[ key ];
			}
		}
		return obj;
	};

	keyRename( eventParams, 'source', 'source_page' );

	const dataKeys = [ 'action', 'category', 'event', 'event_type', 'site_part', 'source_page', 'step' ];
	const detailsKeys = [ 'document_type', 'document_name', 'element', 'error_type', 'grid_location', 'item', 'kit_name', 'layout', 'search_term', 'section', 'site_area', 'site_part', 'sort_direction', 'sort_type', 'tag', 'view_type_clicked' ];
	const data = {};
	const details = {};

	const init = () => {
		objectCreator( detailsKeys, details );
		objectCreator( dataKeys, data );

		const commandSplit = command.split( '/' )
		data.placement = commandSplit[ 0 ];
		data.event = commandSplit[ 1 ];

		// If 'details' is not empty, add the details object to the data object.
		if ( Object.keys( details ).length ) {
			data.details = details;
		}
	};

	init();

	$e.run( command, data );

	console.log( 'appsEventTrackingDispatch', command, JSON.stringify( data ) );
	console.log( 'data', data );
};
