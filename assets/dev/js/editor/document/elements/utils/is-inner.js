const CONTAINER_ELEMENT_TYPE = 'container',
	WIDGET_ELEMENT_TYPE = 'widget';

const getModelAttribute = ( model, attribute ) => {
	if ( 'function' === typeof model?.get ) {
		return model.get( attribute );
	}

	return model?.[ attribute ];
};

const getElementConfig = ( model ) => {
	const elementType = getModelAttribute( model, 'elType' ),
		configKey = WIDGET_ELEMENT_TYPE === elementType
			? getModelAttribute( model, 'widgetType' )
			: elementType;

	return elementor.widgetsCache?.[ configKey ];
};

export const supportsNesting = ( model ) => Boolean( getElementConfig( model )?.support_nesting );

export const isContainerElement = ( model ) => {
	const elementType = getModelAttribute( model, 'elType' );

	if ( CONTAINER_ELEMENT_TYPE === elementType ) {
		return true;
	}

	return WIDGET_ELEMENT_TYPE !== elementType &&
		Boolean( getElementConfig( model )?.atomic ) &&
		supportsNesting( model );
};

export const isInnerContainer = ( parentModel ) => {
	return CONTAINER_ELEMENT_TYPE === getModelAttribute( parentModel, 'elType' ) ||
		supportsNesting( parentModel );
};
