import React, { useContext, useMemo, useRef } from 'react';
import styled from "styled-components";
import ElementWrapper from "./element-wrapper";
import ElementTitle from "./element-title";
import { ConfigContext } from "../app";
import useIsActive from "../hooks/use-is-active";
import { togglePopover } from "../utils/panel-behaviour";
import { goToMainRoute, goToRoute, isInRoute } from "../../../../../assets/js/common/utils/web-cli";

const parseFontToStyle = ( font, fallbackFamily ) => {

	// When the font is only defaults
	if ( '' === font[ 'typography_typography' ] ) {
		return '';
	}

	const defaultKeyParser = ( key ) => key.replace( 'typography_', '' ).replace( '_', '-' );

	let fallbackLowered = fallbackFamily.toLowerCase();
	const familyParser = ( value ) => value ? value + `, ${ fallbackLowered }` : fallbackLowered;
	const sizeParser = ( value ) => {
		if ( ! value || ! value.size ) {
			return '';
		}

		return `${ value.size }${ value.unit }`
	};
	const defaultParser = ( value ) => value;

	const allowedProperties = {
		'typography_font_family': { valueParser: familyParser, keyParser: defaultKeyParser, },
		'typography_font_size': { valueParser: sizeParser, keyParser: defaultKeyParser, },
		'typography_letter_spacing': { valueParser: sizeParser, keyParser: defaultKeyParser, },
		'typography_line_height': { valueParser: sizeParser, keyParser: defaultKeyParser, },
		'typography_word_spacing': { valueParser: sizeParser, keyParser: defaultKeyParser, },
		'typography_font_style': { valueParser: defaultParser, keyParser: defaultKeyParser, },
		'typography_font_weight': { valueParser: defaultParser, keyParser: defaultKeyParser, },
		'typography_text_transform': { valueParser: defaultParser, keyParser: defaultKeyParser, },
		'typography_text_decoration': { valueParser: defaultParser, keyParser: defaultKeyParser, },
	};

	const responsiveProperties = [
		'typography_font_size',
		'typography_letter_spacing',
		'typography_line_height',
		'typography_word_spacing'
	];

	const reducer = ( acc, property, screen ) => {
		let parsers = allowedProperties[ property ];
		const key = parsers.keyParser( property );
		let keyInFontObject = property + (
			screen ? '_' + screen : ''
		);

		const value = parsers.valueParser( font[ keyInFontObject ] );

		if ( value ) {
			acc[ key ] = value;
		}

		return acc;
	};

	const style = Object.keys( allowedProperties ).reduce( ( acc, property ) => reducer( acc, property, '' ), {} );
	const tablet = responsiveProperties.reduce( ( acc, property ) => reducer( acc, property, 'tablet' ), {} );
	const mobile = responsiveProperties.reduce( ( acc, property ) => reducer( acc, property, 'mobile' ), {} );

	const objectToString = ( obj ) => Object.keys( obj ).reduce( ( acc, key ) => acc + `${ key }: ${ obj[ key ] };`, '' );

	// TODO 02/03/2023 : use styled components css helper

	return `
		  ${ objectToString( style ) }
		  @media (max-width: 1024px) {
		    ${ objectToString( tablet ) }
		  }
		  @media (max-width: 767px) {
		    ${ objectToString( mobile ) }
          }
	`;

};

const Title = styled( ElementTitle )`
  font-size: 18px;
`;

const Font = ( { font, type } ) => {
	const source = 'typography';
	const { _id, title } = font;

	const ref = useRef( null );
	const { isActive } = useIsActive( source, _id, ref );

	const config = useContext( ConfigContext );
	const style = useMemo( () => parseFontToStyle( font, config.settings[ 'fallback_font' ] ), [ font, config ] );

	// TODO move outside of component
	const Content = styled.p`
      ${ style }
	`;

	let onClick = () => {
		const route = 'panel/global/global-typography';

		if ( ! isInRoute( route ) ) {
			// Must go through main panel to allow back button to work
			goToMainRoute();
			goToRoute( route, { shouldNotScroll: true } )
		}

		togglePopover( source, type, _id, ! isActive );
	};

	return (
		<ElementWrapper ref={ ref }
		                isActive={ isActive }
		                onClick={ onClick }>
			<Title>{ title }</Title>
			<Content>
				the five boxing wizards jump quickly.
			</Content>
        </ElementWrapper>
	);
};

export default Font;