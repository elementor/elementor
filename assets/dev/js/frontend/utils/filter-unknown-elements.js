export const filterUnknownElements = ( data ) => {
	if ( data?.elements?.length ) {
		return {
			...data,
			elements: filterChildren( data.elements ),
		};
	}
	return data;
};

function filterChildren( elements ) {
	return elements.reduce( ( acc, element ) => {
		if ( ! element ) {
			return acc;
		}
		const isKnownType = elementor.elementsManager.getElementTypeClass( element.widgetType ?? element.elType );
		if ( ! isKnownType ) {
			return acc;
		}

		const processedElement = element.elements?.length
			? { ...element, elements: filterChildren( element.elements ) }
			: element;

		acc.push( processedElement );
		return acc;
	}, [] );
}
