export const appsEventTrackingDispatch = ( command, eventParams ) => {

	const details = {
		action: eventParams.action || {},
		category: eventParams.category || {},
		event: eventParams.event || {},
		event_type: eventParams.event_type || 'click',
		site_part: eventParams.site_part || {},
		source: eventParams.source || {},
		step: eventParams.step || {},
	};
	const data = {
		document_type: eventParams.document_type || {},
		document_name: eventParams.document_name || {},
		element: eventParams.element || {},
		error_type: eventParams.errorType || {},
		grid_location: eventParams.grid_location || {},
		item: eventParams.item || {},
		kit_name: eventParams.kit_name || {},
		layout: eventParams.layout || {},
		search_term: eventParams.searchTerm || {},
		section: eventParams.section || {},
		site_area: eventParams.site_area || {},
		site_part: eventParams.site_part || {},
		sort_direction: eventParams.sort_direction || {},
		sort_type: eventParams.sort_type || {},
		tag: eventParams.tag || {},
		view_type_clicked: eventParams.view_type_clicked || {},
	};

	data.details = details;

	$e.run( command, data );
};
