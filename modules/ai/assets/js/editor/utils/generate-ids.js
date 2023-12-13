// Create missing IDs for the elements.
export const getUniqueId = () => {
	return Math.random().toString( 16 ).substr( 2, 7 );
};

export function generateIds( template ) {
	template.id = getUniqueId().toString();

	if ( template.elements?.length ) {
		template.elements.map( ( child ) => generateIds( child ) );
	}

	return template;
}
