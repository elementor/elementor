import React, { useMemo } from 'react';
import styled from "styled-components";
import ElementWrapper from "./element-wrapper";
import ElementTitle from "./element-title";

const parseFontToStyle = ( font ) => {

	const defaultKeyParser = ( key ) => key.replace( 'typography_', '' ).replace( '_', '-' );

	const familyParser = ( value ) => value ? value + ', sans-serif' : 'sans-serif'; // TODO 23/02/2023 : get fallback from backend kit settings
	const sizeParser = ( value ) => {
		if ( ! value || ! value.size ) {
			return '';
		}

		return `${ value.size }${ value.unit }`
	};
	const defaultParser = ( value ) => value;

	// TODO 23/02/2023 : what if family not exist?
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

const Font = ( { font, } ) => {
	const style = useMemo( () => parseFontToStyle( font ), [ font ] );
	// TODO 23/02/2023 : if default property it will not pull from right parent.
	const Title = styled( ElementTitle )`
      font-size: 18px;
	`;

	const Content = styled.p`
      ${ style }
	`;

	return (
		<ElementWrapper isActive={ font.isActive }
		                id={ font._id } source='typography'>
			<Title>{ font.title }</Title>
			<Content>
				the five boxing wizards jump quickly.
			</Content>
        </ElementWrapper>
	);
};

export default Font;