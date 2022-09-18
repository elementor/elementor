const elementsRegressionConfig = require( '../elements-regression.config.js' );

const config = {
	elements: {
		...elementsRegressionConfig.elements,
	},
	controls: {
		'*': {},
		...elementsRegressionConfig.controls,
	},
};

function merge( target, source ) {
	const result = {};

	[ 'include', 'exclude' ].forEach( ( key ) => {
		if ( source.hasOwnProperty( key ) || target.hasOwnProperty( key ) ) {
			result[ key ] = [
				...( target[ key ] || [] ),
				...( source[ key ] || [] ),
			];
		}
	} );

	return result;
}

function compare( term, type ) {
	if ( term instanceof RegExp ) {
		return term.test( type );
	}

	return term === type;
}

function isIncluded( config, type ) {
	if ( ! config.hasOwnProperty( 'include' ) ) {
		return true;
	}

	return config.include.some( ( term ) => compare( term, type ) );
}

function isExcluded( config, type ) {
	if ( ! config.hasOwnProperty( 'exclude' ) ) {
		return false;
	}

	return config.exclude.some( ( term ) => compare( term, type ) );
}

module.exports = {
	isWidgetIncluded: ( widgetType ) => isIncluded( config.elements, widgetType ),
	isWidgetExcluded: ( widgetType ) => isExcluded( config.elements, widgetType ),
	isControlIncluded: ( widgetType, controlType ) => isIncluded(
		merge( config.controls[ '*' ], config.controls[ widgetType ] || {} ),
		controlType,
	),
	isControlExcluded: ( widgetType, controlType ) => isExcluded(
		merge( config.controls[ '*' ], config.controls[ widgetType ] || {} ),
		controlType,
	),
};
