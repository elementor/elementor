const isOmitted = ( propType ) => {
	const meta = propType?.meta;

	return !! meta && ! Array.isArray( meta ) && true === meta.sensitive;
};

const getSchema = ( elementData ) => {
	const type = elementData.widgetType || elementData.elType;

	return window.elementor?.widgetsCache?.[ type ]?.atomic_props_schema;
};

export function omitPropsByMeta( elementData ) {
	if ( ! elementData || 'object' !== typeof elementData ) {
		return elementData;
	}

	const result = { ...elementData };
	const schema = getSchema( elementData );

	if ( schema && elementData.settings && 'object' === typeof elementData.settings ) {
		result.settings = Object.fromEntries(
			Object.entries( elementData.settings ).filter( ( [ key ] ) => ! isOmitted( schema[ key ] ) ),
		);
	}

	if ( Array.isArray( elementData.elements ) ) {
		result.elements = elementData.elements.map( omitPropsByMeta );
	}

	return result;
}

export default omitPropsByMeta;
