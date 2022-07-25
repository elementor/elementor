import { ConstTrackingMetaParams, ConstTrackingEventParams } from 'elementor-app/consts/consts';

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
	}
	const meta = {
		...( eventParams.event ? { event: eventParams.event } : {} ),
		...( eventParams.source ? { source: eventParams.source } : {} ),
		...( eventParams.action ? { action: eventParams.action } : {} ),
		...( eventParams.event_type ? { event_type: eventParams.event_type } : { event_type: 'click' } ),
		...( eventParams.step ? { step: eventParams.step } : {} ),
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
