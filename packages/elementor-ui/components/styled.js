import { useContext, forwardRef } from 'react';
import { ThemeContext } from 'styled-components';
import { getStyle } from 'e-components/utils';
import styled from 'e-components';
//import styled from '@emotion/styled';

import { css } from '@emotion/css';

const baseComponents = {},
	cachedComponents = {};

const Styled = forwardRef( ( props, ref ) => {
	const themeContext = useContext( ThemeContext ),
		{ cacheGroup, cacheKey, tag, extendStyles, extend } = props,
		styledProps = getStyledProps( props ),
		stylesData = { props: styledProps, config: themeContext.config },
		styles = getStyle( props.styles, stylesData ),
		finalProps = { ...props };

	const StyledComponent = styled( extend || tag )``;

	// if ( cacheGroup && cacheKey ) {
	// 	StyledComponent = createCachedComponent( { cacheKey, cacheGroup, tag, styles, styledProps } );
	// } else {
	// 	StyledComponent = styled( tag )`${ styles.shared }${ styles.unique }`;
	// }

	// The css should not be executed in 'extend' mode, because it's css should be inserted to the DOM only after the extended component was rendered.
	if ( ! extend ) {
		console.log( '' );
		console.log( 'NOT EXTEND:', { ...finalProps } );
		console.log( '### - finalProps', { ...finalProps } );
		console.log( '### - props', { ...props } );
		console.log( '### - extendStyles', extendStyles );
		finalProps.className += ' ' + css`${ styles.shared }${ styles.unique }`;

		if ( extendStyles?.length ) {
			extendStyles.forEach( ( styleItem ) => {
				const { shared, unique } = getStyle( styleItem, stylesData );

				finalProps.className += ' ' + css`${ shared }${ unique }`;
			} );
		}
	}

	const nonStyledProps = [ 'tag', 'styles', 'extend', 'extendStyles', 'displayName', 'propTypes', 'cacheKey', 'cacheGroup', 'extendClassName' ];

	// Removing props that are not related to the component styles object.
	nonStyledProps.forEach( ( prop ) => delete finalProps[ prop ] );

	if ( extend ) {
		console.log( '' );
		console.log( 'EXTEND:', { ...finalProps } );
		console.log( '1. ### - finalProps', { ...finalProps } );
		console.log( '### - props', { ...props } );
		if ( ! Array.isArray( finalProps.extendStyles ) ) {
			finalProps.extendStyles = [];
		}
		if ( ! Array.isArray( finalProps.extendClassName ) ) {
			finalProps.extendClassName = [];
		}

		finalProps.extendStyles.push( props.styles );
		finalProps.extendClassName.push( props.className );

		if ( props.extendStyles?.length ) {
			finalProps.extendStyles = [ ...finalProps.extendStyles, ...props.extendStyles ];
		}

		if ( props.extendClassName?.length ) {
			finalProps.extendClassName = [ ...finalProps.extendClassName, ...props.extendClassName ];
		}

		console.log( '2. ### - finalProps', { ...finalProps } );
	}

	return <StyledComponent { ...finalProps } ref={ ref }>{ finalProps.children }</StyledComponent>;
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

	const nonStyledProps = [ ...baseProps, 'tag', 'styles', 'extendStyles', 'extend', 'style', 'displayName', 'propTypes', 'cacheKey', 'cacheGroup', 'extendClassName' ],
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
	tag: PropTypes.string,
	cacheGroup: PropTypes.string,
	cacheKey: PropTypes.string,
	className: PropTypes.string,
	children: PropTypes.any,
	component: PropTypes.string,
	extend: PropTypes.any,
	propTypes: PropTypes.object,
	styles: PropTypes.oneOfType( [ PropTypes.object, PropTypes.string ] ),
	extendStyles: PropTypes.array,
	extendClassName: PropTypes.array,
};

Styled.defaultProps = {
	className: '',
	styles: '',
	extendStyles: [],
	extendClassName: [],
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
