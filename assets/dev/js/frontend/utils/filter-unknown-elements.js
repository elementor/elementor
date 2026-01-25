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
	return elements.filter( ( el ) => {
		if ( ! el ) {
			return false;
		}

		const { widgetType, elType } = el;
		return !! elementor.elementsManager.getElementTypeClass( widgetType ?? elType );
	} ).map( ( element ) => {
		if ( element.elements?.length ) {
			return {
				...element,
				elements: filterChildren( element.elements ),
			};
		}

		return element;
	} );
}
