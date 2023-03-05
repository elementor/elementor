import React, { useRef } from 'react';
import styled from 'styled-components';
import ElementTitle from './element-title';
import ElementWrapper from './element-wrapper';
import useIsActive from '../hooks/use-is-active';
import { togglePopover } from '../utils/panel-behaviour';
import { goToRoute, isInRoute } from '../../../../../assets/js/common/utils/web-cli';

const Content = styled.div`
	background-color: ${ ( props ) => props.hex };
	padding: 74px 1px 7px 10px;
	border-style: solid;
	border-width: 1px 1px 1px 1px;
	border-color: #D5DADF;
	border-radius: 3px 3px 3px 3px;
`;

const HexString = styled.p`
	width: ${ ( props ) => props.width };
	margin: 0;
	color: #FFFFFF;
	font-family: Roboto, sans-serif;
	height: 12px;
	font-size: 12px;
	font-weight: 500;
	text-transform: uppercase;
	font-style: normal;
	text-decoration: none;
	line-height: 1.1em;
	letter-spacing: 0;
	word-spacing: 0;
`;

/**
 *
 * @param color { _id, title, color}
 * @param width
 * @param type
 * @return {JSX.Element}
 * @constructor
 */
const Color = ( { color, width, type } ) => {
	const source = 'colors';
	const { _id, title, color: hex } = color;

	const ref = useRef( null );
	const { isActive } = useIsActive( source, _id, ref );

	return (
		<ElementWrapper ref={ ref }
			isActive={ isActive }
			onClick={ () => {
				const route = 'panel/global/global-colors';

				if ( ! isInRoute( route ) ) {
					goToRoute( route, { shouldNotScroll: true } );
				}

				togglePopover( source, type, _id );
			} }>
			<ElementTitle>{ title }</ElementTitle>
			<Content hex={ hex }>
				<HexString width={ width }>{ hex }</HexString>
			</Content>
		</ElementWrapper>
	);
};

export default Color;
