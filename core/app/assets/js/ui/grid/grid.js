export default function Grid( props ) {
	const propsMap = [
			{ prop: 'direction', isModifier: true },
			{ prop: 'justify', isModifier: true },
			{ prop: 'alignContent', isModifier: true },
			{ prop: 'alignItems', isModifier: true },
			{
				prop: 'container',
				nested: [
					{ prop: 'spacing', isModifier: true, ignoreValue: true },
					{ prop: 'noWrap', isModifier: true },
					{ prop: 'wrapReverse', isModifier: true },
				],
			},
			{
				prop: 'item',
				nested: [
					{ prop: 'zeroMinWidth', isModifier: true },
					{ prop: 'xs' },
					{ prop: 'sm' },
					{ prop: 'md' },
					{ prop: 'lg' },
					{ prop: 'xl' },
					{ prop: 'xxl' },
				],
			},
		],
		getStyle = () => isValidPropValue( props.spacing ) ? { '--grid-spacing-gutter': props.spacing + 'px' } : {},
		classes = [ getBaseClassName(), props.className, ...getPropsClasses( propsMap, props ) ];

	return (
		<div style={ getStyle() } className={ classes.filter( ( classItem ) => '' !== classItem ).join( ' ' ) }>
			{ props.children }
		</div>
	);
}

/*
	This function convert props into classes, according certain rules and structure:

	- Each prop name gets automatically a baseClassName (eps-grid) as a prefix.
	- When a prop has no value, only the prop name will be rendered in the class name (<Grid justify> --> eps-grid--justify).
	- When a certain prop has the isModifier flag: the prop class name will be added with a double dash (eps-grid--justify-XXX).
	- When the isModifier flag does not exist (or false) the prop class name will be added with one dash (eps-grid-item).
	- Each 'camel case' prop name will be automatically converted into a 'dash case' (alignItems --> align-items)
	- When a certain prop has a nested array: the nested values will be added to the base prop name (eps-grid-container-no-wrap).
	- When a certain prop has the repeatOnValue flag: the prop will be rendered twice - with and without the value:
	  Example: <Grid container spacing={5}> will render: container-spacing + container-spacing-5, instead of just: container-spacing-5.
 */
function getPropsClasses( propsMap, props, prefix ) {
	let classes = [];

	for ( const propData of propsMap ) {
		if ( props[ propData.prop ] ) {
			const propValue = isValidPropValue( props[ propData.prop ] ) && ! propData.ignoreValue ? '-' + props[ propData.prop ] : '',
				connection = propData.isModifier ? '--' : '-';

			let propName = connection + camelCaseToDashCase( propData.prop );

			if ( prefix ) {
				propName = prefix + propName;
			}

			if ( propData.repeatOnValue && '' !== propValue ) {
				classes.push( getBaseClassName() + propName );
			}

			classes.push( getBaseClassName() + propName + propValue );

			if ( propData.nested?.length ) {
				classes = classes.concat( getPropsClasses( propData.nested, props, propName ) );
			}
		}
	}

	return classes;
}

function getBaseClassName() {
	return 'eps-grid';
}

function isValidPropValue( propValue ) {
	return propValue && 'boolean' !== typeof propValue;
}

function camelCaseToDashCase( str ) {
	return str.replace( /([A-Z])/g, ( char ) => '-' + char.toLowerCase() );
}

Grid.propTypes = {
	className: PropTypes.string,
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
