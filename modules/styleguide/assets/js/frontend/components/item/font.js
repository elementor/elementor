import React, { useMemo, useRef } from 'react';
import styled from 'styled-components';
import ElementWrapper from '../global/element-wrapper';
import ElementTitle from '../global/element-title';
import useIsActive from '../../hooks/use-is-active';
import { isInRoute } from '../../utils/web-cli';
import { sendCommand } from '../../utils/send-command';
import useSettings from '../../hooks/use-settings';

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

export default function Font( props ) {
	const { item, type } = props;

	const source = 'typography';
	const { _id, title } = item;

	const ref = useRef( null );
	const { isActive } = useIsActive( source, _id, ref );

	const { isLoading, settings } = useSettings( props );

	const style = useMemo( () => {
		if ( isLoading ) {
			return {};
		}

		parseFontToStyle( item, settings.fallback_font );
	}, [ item, settings ] );

	const Title = styled( ElementTitle )`
      font-size: 18px;
	`;

	const Content = styled.p`
		${ style }
	`;

	const onClick = () => {
		// Typography popover closes on every click in the window so only need to open.
		if ( isActive ) {
			return;
		}

		const route = 'panel/global/global-typography';

		if ( ! isInRoute( route ) ) {
			sendCommand( `${ route }/route`, { shouldNotScroll: true } );
		}

		togglePopover( source, type, _id );
	};

	return (
		<ElementWrapper type="font" ref={ ref }
			isActive={ isActive }
			onClick={ onClick }>
			<Title>{ title }</Title>
			<Content>
				the five boxing wizards jump quickly.
			</Content>
		</ElementWrapper>
	);
}
