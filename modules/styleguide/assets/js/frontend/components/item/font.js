import React, { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { useActiveContext } from '../../contexts/active-context';
import { useSettings } from '../../contexts/settings';
import ElementWrapper from '../global/element-wrapper';
import ElementTitle from '../global/element-title';

const Title = styled( ElementTitle )`
	font-size: 18px;
`;

const Content = styled.p.withConfig( {
	shouldForwardProp: ( prop ) => 'style' !== prop,
} )`
	${ ( { style } ) => {
		const styleObjectToString = ( obj ) => {
			return Object.keys( obj ).reduce( ( acc, key ) => {
				return acc + `${ key }: ${ obj[ key ] };`;
			}, '' );
		};

		return `
			${ styleObjectToString( style.style ) }

			@media (max-width: 1024px) {
				${ styleObjectToString( style.tablet ) }
			}

			@media (max-width: 767px) {
				${ styleObjectToString( style.mobile ) }
			}
		`;
	} };
`;

const parseFontToStyle = ( font, fallbackFamily ) => {
	const defaultKeyParser = ( key ) => key.replace( 'typography_', '' ).replace( '_', '-' );

	const fallbackLowered = fallbackFamily.toLowerCase();
	const familyParser = ( value ) => value ? value + `, ${ fallbackLowered }` : fallbackLowered;
	const sizeParser = ( value ) => {
		if ( ! value || ! value.size ) {
			return '';
		}

		return `${ value.size }${ value.unit }`;
	};
	const defaultParser = ( value ) => value;

	const allowedProperties = {
		typography_font_family: { valueParser: familyParser, keyParser: defaultKeyParser },
		typography_font_size: { valueParser: sizeParser, keyParser: defaultKeyParser },
		typography_letter_spacing: { valueParser: sizeParser, keyParser: defaultKeyParser },
		typography_line_height: { valueParser: sizeParser, keyParser: defaultKeyParser },
		typography_word_spacing: { valueParser: sizeParser, keyParser: defaultKeyParser },
		typography_font_style: { valueParser: defaultParser, keyParser: defaultKeyParser },
		typography_font_weight: { valueParser: defaultParser, keyParser: defaultKeyParser },
		typography_text_transform: { valueParser: defaultParser, keyParser: defaultKeyParser },
		typography_text_decoration: { valueParser: defaultParser, keyParser: defaultKeyParser },
	};

	const responsiveProperties = [
		'typography_font_size',
		'typography_letter_spacing',
		'typography_line_height',
		'typography_word_spacing',
	];

	const reducer = ( acc, property, screen ) => {
		const parsers = allowedProperties[ property ];
		const key = parsers.keyParser( property );
		const keyInFontObject = property + (
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

	return {
		style,
		tablet,
		mobile,
	};
};

export default function Font( props ) {
	const { activeElement, activateElement, getElementControl } = useActiveContext();

	const { item, type } = props;

	const source = 'typography';
	const { _id, title } = item;

	const elementControl = getElementControl( type, source, _id );

	const ref = useRef( null );

	const { settings, isReady } = useSettings();

	const generateStyle = useMemo( () => {
		if ( ! isReady ) {
			return '';
		}

		return parseFontToStyle( item, settings.get( 'fonts' ).get( 'fallback_font' ) );
	}, [ item, settings ] );

	const onClick = () => {
		activateElement( type, source, _id );
	};

	useEffect( () => {
		if ( elementControl === activeElement ) {
			ref.current.scrollIntoView( {
				behavior: 'smooth',
				block: 'center',
				inline: 'center',
			} );
		}
	}, [ activeElement ] );

	return (
		<ElementWrapper
			columns={ props.columns }
			ref={ ref }
			isActive={ elementControl === activeElement }
			onClick={ onClick }
		>
			<Title>{ title }</Title>
			<Content style={ generateStyle }>{ __( 'The five boxing wizards jump quickly.', 'elementor' ) }</Content>
		</ElementWrapper>
	);
}

Font.propTypes = {
	item: PropTypes.shape( {
		_id: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		color: PropTypes.string,
	} ).isRequired,
	type: PropTypes.string.isRequired,
	columns: PropTypes.shape( {
		desktop: PropTypes.number,
		mobile: PropTypes.number,
	} ),
};
