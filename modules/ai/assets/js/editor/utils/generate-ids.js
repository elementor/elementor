// Create missing IDs for the elements.
export function generateIds( template ) {
	template.id = elementorCommon.helpers.getUniqueId().toString();

	if ( template.elements?.length ) {
		template.elements.map( ( child ) => generateIds( child ) );
	}

	return template;
}
