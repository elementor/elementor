// Removes unknown widgets from the data recursively

export const filterUnknownElements = ( data ) => {
	if ( data?.elements?.length ) {
		data.elements = filterChildren( data.elements );
	}

	return data;
};

const filterChildren = ( elements ) => elements.filter( ( el ) => {
	if ( ! el ) {
		return false;
	}

	const elementType = el.widgetType || el.elType,
		elementTypeClass = elementor.elementsManager.getElementTypeClass( elementType );

	return !! elementTypeClass;
} ).map( ( element ) => {
	if ( element.elements?.length ) {
		element.elements = filterChildren( element.elements );
	}

	return element;
} );
