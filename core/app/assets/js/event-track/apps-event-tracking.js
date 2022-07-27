export const appsEventTrackingDispatch = ( command, eventParams ) => {
	const data = {
		...{ element: eventParams.element || null },
		...{ search_term: eventParams.searchTerm || null },
		...{ error_type: eventParams.errorType || null },
		...{ site_part: eventParams.site_part || null },
		...{ sort_direction: eventParams.sort_direction || null },
		...{ sort_type: eventParams.sort_type || null },
		...{ section: eventParams.section || null },
		...{ item: eventParams.item || null },
		...{ grid_location: eventParams.grid_location || null },
		...{ tag: eventParams.tag || null },
		...{ view_type_clicked: eventParams.view_type_clicked || null },
		...{ site_area: eventParams.site_area || null },
		...{ kit_name: eventParams.kit_name || null },
		...{ document_type: eventParams.document_type || null },
		...{ document_name: eventParams.document_name || null },
		...{ layout: eventParams.layout || null },
	};
	const metadata = {
		...{ site_part: eventParams.site_part || null },
		...{ event: eventParams.event || null },
		...{ source: eventParams.source || null },
		...{ action: eventParams.action || null },
		...{ event_type: eventParams.event_type || 'click' },
		...{ step: eventParams.step || null },
		...{ category: eventParams.category || null },
		// ...{ connect_site_key: elementorAppConfig.connect_site_key || null },
	};

	$e.run(
		command,
		data,
		metadata,
	);

	console.log( 'metadata: ', metadata )
};
