import React, { useEffect, useMemo, useContext, useRef, useState } from 'react';
import styled from 'styled-components';
import ElementWrapper from '../global/element-wrapper';
import ElementTitle from '../global/element-title';
import { ActiveContext } from '../../contexts/active-context';
import { useSettings } from '../../contexts/settings';

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
	const { activeElement, isActiveElement, activateElement } = useContext( ActiveContext );
	const [ isActive, setIsActive ] = useState( false );

	const { item, type } = props;

	const source = 'typography';
	const { _id, title } = item;

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

		// TODO: Manor please implement
		// // Typography popover closes on every click in the window so only need to open.
		// if ( isActive ) {
		// 	return;
		// }
		//
		// const route = 'panel/global/global-typography';
		//
		// if ( ! window.top.$e.routes.is( route ) ) {
		// 	window.top.$e.run( `${ route }/route`, { shouldNotScroll: true } );
		// }
		//
		// // togglePopover( source, type, _id );
	};

	useEffect( () => {
		if ( isActiveElement( source, _id ) ) {
			setIsActive( true );
			ref.current.scrollIntoView( {
				behavior: 'smooth',
				block: 'center',
				inline: 'center',
			} );
		} else {
			setIsActive( false );
		}
	}, [ activeElement ] );

	return (
		<ElementWrapper
			columns={ props.columns }
			ref={ ref }
			isActive={ isActive }
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
