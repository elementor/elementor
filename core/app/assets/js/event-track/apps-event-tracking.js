export const appsEventTrackingDispatch = ( command, eventParams ) => {
	const detailsKeys = [ 'action', 'category', 'event', 'event_type', 'site_part', 'source', 'step' ];
	const dataKeys = [ 'document_type', 'document_name', 'element', 'error_type', 'grid_location', 'item', 'kit_name', 'layout', 'search_term', 'section', 'site_area', 'site_part', 'sort_direction', 'sort_type', 'tag', 'view_type_clicked' ];
	const data = {};
	const details = {};

	const init = () => {
		objectCreator( detailsKeys, data );
		objectCreator( dataKeys, details );
		data.placement = 'kit-library';

		if ( ! Object.keys( length ).length ) {
			data.details = details;
		}
	};

	// Add existing event params to the data object.
	const objectCreator = ( array, obj ) => {
		for ( const key of array ) {
			if ( eventParams.hasOwnProperty( key ) && eventParams[ key ] !== null ) {
				obj[ key ] = eventParams[ key ];
			}
		}
		return obj;
	};

	init();

	$e.run( command, data );
	console.log( 'appsEventTrackingDispatch', command, JSON.stringify( data ) );
};
