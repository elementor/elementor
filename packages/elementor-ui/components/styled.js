import { useContext, forwardRef } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { getStyle } from 'e-components/utils';

const baseComponents = {},
	cachedComponents = {};

const Styled = forwardRef( ( props, ref ) => {
	const themeContext = useContext( ThemeContext ),
		{ cacheGroup, cacheKey, tag, extendStyles } = props,
		styledProps = getStyledProps( props ),
		stylesData = { props: styledProps, config: themeContext.config },
		styles = getStyle( props.styles, stylesData );

	let StyledComponent;

	if ( cacheGroup && cacheKey ) {
		StyledComponent = createCachedComponent( { cacheKey, cacheGroup, tag, styles, styledProps } );
	} else {
		StyledComponent = styled[ tag ]`${ styles.shared }${ styles.unique }`;
	}

	if ( extendStyles ) {
		const extendedStyles = getStyle( extendStyles, stylesData );

		StyledComponent = styled( StyledComponent )`${ extendedStyles.shared }${ extendedStyles.unique }`;
	}

	return <StyledComponent { ...props } ref={ ref }>{ props.children }</StyledComponent>;
} );

const createCachedComponent = ( { cacheGroup, cacheKey, tag, styles, styledProps } ) => {
	// Adding the tag value to consider the tag type when caching the styled component.
	styledProps.tag = tag;

	// Heading__size-md_variant-h1
	const componentId = styledProps && cacheKey + '__' + Object.keys( styledProps ).sort().map( ( key ) => `${ key }-${ styledProps[ key ] }` ).join( '_' );

	let BaseComponent, StyledComponent;

	if ( ! cachedComponents[ cacheGroup ] ) {
		cachedComponents[ cacheGroup ] = {};
	}

	if ( componentId && cachedComponents[ cacheGroup ][ componentId ] ) {
		StyledComponent = cachedComponents[ cacheGroup ][ componentId ];
	} else {
		if ( ! baseComponents[ cacheGroup ] ) {
			baseComponents[ cacheGroup ] = {};
		}

		// Adding the tag value to consider the tag type when caching the base component.
		const baseKey = cacheKey + '__' + tag;

		if ( ! baseComponents[ cacheGroup ][ baseKey ] ) {
			baseComponents[ cacheGroup ][ baseKey ] = styled[ tag ]`${ styles.shared }`;
		}

		BaseComponent = baseComponents[ cacheGroup ][ baseKey ];

		StyledComponent = styled( BaseComponent )`${ styles.unique }`;

		if ( componentId ) {
			cachedComponents[ cacheGroup ][ componentId ] = StyledComponent;
		}
	}

	return StyledComponent;
};

const getStyledProps = ( props ) => {
	const baseProps = [ 'children', 'className' ];

	// In case that propsTypes exist, we use them to identify the styled props in order to save all of the non-styled props removal.
	if ( props.propTypes ) {
		const styledPropTypes = {};

		Object
			.keys( props.propTypes )
			.map( ( key ) => {
				if ( ! baseProps.includes( key ) ) {
					styledPropTypes[ key ] = props[ key ];
				}
			} );

		return styledPropTypes;
	}

	const nonStyledProps = [ ...baseProps, 'tag', 'styles', 'extendStyles', 'extend', 'style', 'displayName', 'propTypes', 'cacheKey', 'cacheGroup' ],
		styledProps = { ...props };

	// Removing props that are not related to the component styles object.
	nonStyledProps.forEach( ( prop ) => delete styledProps[ prop ] );

	// Removing events props.
	for ( const key in styledProps ) {
		// onClick, onKeyDown etc.
		if ( key.match( /on([A-Z])/ ) ) {
			delete styledProps[ key ];
		}
	}

	return styledProps;
};

Styled.displayName = 'Styled';

Styled.propTypes = {
	tag: PropTypes.string.isRequired,
	cacheGroup: PropTypes.string,
	cacheKey: PropTypes.string,
	className: PropTypes.string,
	children: PropTypes.any,
	component: PropTypes.string,
	propTypes: PropTypes.object,
	styles: PropTypes.oneOfType( [ PropTypes.object, PropTypes.string ] ),
	extendStyles: PropTypes.oneOfType( [ PropTypes.object, PropTypes.string ] ),
};

Styled.defaultProps = {
	className: '',
	styles: '',
	extendStyles: '',
};

export default Styled;

export const withStyles = ( StyledComponent ) => {
	return forwardRef( ( props, ref ) => {
		const { displayName, propTypes } = StyledComponent,
			newProps = { ...props, displayName, propTypes };

		if ( props.styles ) {
			// Preventing the collision of the outer component 'styles' prop and the inner component 'styles' prop.
			newProps.extendStyles = props.styles;
			delete newProps.styles;
		}

		return <StyledComponent { ...newProps } ref={ ref } />;
	} );
};
