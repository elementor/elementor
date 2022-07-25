// import { ConstTrackingMetaParams, ConstTrackingEventParams } from 'elementor-app/consts/consts';

// export const eventTrackingDispatch = ( command, eventParams, metaParams ) => {
// 	const eventData = {
// 		...ConstTrackingEventParams,
// 		...eventParams,
// 	};
//
// 	const metaData = {
// 		meta: {
// 			...ConstTrackingMetaParams,
// 			...metaParams,
// 		},
// 	};
//
// 	$e.run( command, eventData, metaData );
// 	console.log( 'eventTracking', JSON.parse( JSON.stringify( { command, eventData, metaData } ) ) );
// };

export const eventTrackingDispatch = ( command, eventParams ) => {

	const data = {
		...( eventParams.element ? { element: eventParams.element } : {} ),
		...( eventParams.searchTerm ? { search_term: eventParams.searchTerm } : {} ),
		...( eventParams.errorType ? { search_term: eventParams.errorType } : {} ),
		...( eventParams.site_part ? { site_part: eventParams.site_part } : {} ),
		...( eventParams.sort_direction ? { sort_direction: eventParams.sort_direction } : {} ),
		...( eventParams.section ? { section: eventParams.section } : {} ),
		...( eventParams.item ? { item: eventParams.item } : {} ),
		...( eventParams.grid_location ? { grid_location: eventParams.grid_location } : {} ),
		...( eventParams.tag ? { tag: eventParams.tag } : {} ),
		...( eventParams.view_type_clicked ? { view_type_clicked: eventParams.view_type_clicked } : {} ),
		...( eventParams.method ? { method: eventParams.method } : {} ),
		...( eventParams.site_area ? { site_area: eventParams.site_area } : {} ),
		...( eventParams.kit_name ? { kit_name: eventParams.kit_name } : {} ),
		...( eventParams.document_type ? { document_type: eventParams.document_type } : {} ),
		...( eventParams.document_name ? { document_name: eventParams.document_name } : {} ),
		...( eventParams.layout ? { layout: eventParams.layout } : {} ),

	}
	const meta = {
		...( eventParams.site_part ? { site_part: eventParams.site_part } : {} ),
		...( eventParams.event ? { event: eventParams.event } : {} ),
		...( eventParams.source ? { source: eventParams.source } : {} ),
		...( eventParams.action ? { action: eventParams.action } : {} ),
		...( eventParams.event_type ? { event_type: eventParams.event_type } : { event_type: 'click' } ),
		...( eventParams.step ? { step: eventParams.step } : {} ),
		...( eventParams.category ? { category: eventParams.category } : {} ),
	}

	$e.run(
		command,
		data,
		{
			meta,
		},
	);

	console.log( 'newEventTrackingDispatch', JSON.parse( JSON.stringify( { command, eventParams, data, meta } ) ) );
};
