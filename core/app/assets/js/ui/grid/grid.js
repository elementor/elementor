export default function Grid( props ) {
	const propsMap = {
			direction: '--direction{{ -VALUE }}',
			justify: '--justify{{ -VALUE }}',
			alignContent: '--align-content{{ -VALUE }}',
			alignItems: '--align-items{{ -VALUE }}',
			container: '-container',
			noWrap: '-container--no-wrap',
			wrapReverse: '-container--wrap-reverse',
			spacing: '-container--spacing',
			item: '-item',
			zeroMinWidth: '-item--zero-min-width',
			xs: '-item-xs{{ -VALUE }}',
			sm: '-item-sm{{ -VALUE }}',
			md: '-item-md{{ -VALUE }}',
			lg: '-item-lg{{ -VALUE }}',
			xl: '-item-xl{{ -VALUE }}',
			xxl: '-item-xxl{{ -VALUE }}',
		},
		getStyle = () => isValidPropValue( props.spacing ) ? { '--grid-spacing-gutter': props.spacing + 'px' } : {},
		classes = [ getBaseClassName(), props.className, ...getPropsClasses( propsMap, props ) ];

	return (
		<div style={ getStyle() } className={ classes.filter( ( classItem ) => '' !== classItem ).join( ' ' ) }>
			{ props.children }
		</div>
	);
}

function getPropsClasses( propsMap, props ) {
	const classes = [];

	for ( const prop in propsMap ) {
		if ( props[ prop ] ) {
			const propValue = isValidPropValue( props[ prop ] ) ? props[ prop ] : '';

			classes.push( getBaseClassName() + renderPropValueBrackets( propsMap[ prop ], propValue ) );
		}
	}

	return classes;
}

function renderPropValueBrackets( propClass, propValue ) {
	const brackets = propClass.match( /{{.*?}}/ );

	if ( brackets ) {
		const bracketsValue = propValue ? brackets[ 0 ].replace( /[{ }]/g, '' ).replace( /value/i, propValue ) : '';

		propClass = propClass.replace( brackets[ 0 ], bracketsValue );
	}

	return propClass;
}

function getBaseClassName() {
	return 'eps-grid';
}

function isValidPropValue( propValue ) {
	return propValue && 'boolean' !== typeof propValue;
}

Grid.propTypes = {
	className: PropTypes.string,
	direction: PropTypes.string,
	justify: PropTypes.string,
	alignContent: PropTypes.string,
	alignItems: PropTypes.string,
	spacing: PropTypes.number,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

Grid.defaultProps = {
	className: '',
};
