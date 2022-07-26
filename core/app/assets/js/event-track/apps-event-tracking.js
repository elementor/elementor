export const appsEventTrackingDispatch = ( command, eventParams ) => {
	const data = {
		// ...( { element: eventParams.element } || {} ),
		// ...{ search_term: eventParams.searchTerm || {} },
		// ...{ error_type: eventParams.errorType || {} },
		// ...{ site_part: eventParams.site_part || {} },
		// ...{ sort_direction: eventParams.sort_direction || {} },
		// ...{ sort_type: eventParams.sort_type || {} },
		// ...{ section: eventParams.section || {} },
		// ...{ item: eventParams.item || {} },
		// ...{ grid_location: eventParams.grid_location || {} },
		// ...{ tag: eventParams.tag || {} },
		// ...{ view_type_clicked: eventParams.view_type_clicked || {} },
		// ...{ site_area: eventParams.site_area || {} },
		// ...{ kit_name: eventParams.kit_name || {} },
		// ...{ document_type: eventParams.document_type || {} },
		// ...{ document_name: eventParams.document_name || null },
		// ...{ layout: eventParams.layout || {} },



		...( eventParams.searchTerm ? { search_term: eventParams.searchTerm } : {} ),
		...( eventParams.errorType ? { error_type: eventParams.errorType } : {} ),
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
	};
	const meta = {
		...( eventParams.site_part ? { site_part: eventParams.site_part } : {} ),
		...( eventParams.event ? { event: eventParams.event } : {} ),
		...( eventParams.source ? { source: eventParams.source } : {} ),
		...( eventParams.action ? { action: eventParams.action } : {} ),
		...( eventParams.event_type ? { event_type: eventParams.event_type } : { event_type: 'click' } ),
		...( eventParams.step ? { step: eventParams.step } : {} ),
		...( eventParams.category ? { category: eventParams.category } : {} ),

		// ...{ site_part: eventParams.site_part || {} },
		// ...{ event: eventParams.event || {} },
		// ...{ source: eventParams.source || {} },
		// ...{ action: eventParams.action || {} },
		// ...{ event_type: eventParams.event_type || {} },
		// ...{ step: eventParams.step || {} },
		// ...{ category: eventParams.category || {} },
	};

	$e.run(
		command,
		data,
		{
			meta,
		},
	);

	console.log( 'appsEventTrackingDispatch', JSON.parse( JSON.stringify( { command, eventParams, data, meta } ) ) );
};
