import React, { useRef } from 'react';
import styled from 'styled-components';
import ElementTitle from './element-title';
import ElementWrapper from './element-wrapper';
import useIsActive from '../hooks/use-is-active';
import { togglePopover } from '../utils/panel-behaviour';
import { goToRoute, isInRoute } from '../../utils/web-cli';
import { sendCommand } from '../../utils/send-command';

const Content = styled.div`
  display: flex;
  width: 100%;
  height:100px;
	background-color: ${ ( props ) => props.hex };
	border-style: solid;
	border-width: 1px 1px 1px 1px;
	border-color: #D5DADF;
	border-radius: 3px 3px 3px 3px;
  align-items: end;
`;

const HexString = styled.p`
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
  margin: 12px;
`;

/**
 *
 * @param color { _id, title, color}
 * @param width
 * @param type
 * @return {JSX.Element}
 * @constructor
 */
const Color = ( { color, type } ) => {
	const source = 'colors';
	const { _id, title, color: hex } = color;

	const ref = useRef( null );
	const { isActive } = useIsActive( source, _id, ref );

	return (
		<ElementWrapper type="color" ref={ ref }
			isActive={ isActive }
			onClick={ () => {
				const route = 'panel/global/global-colors';

				if ( ! isInRoute( route ) ) {
					sendCommand( `${ route }/route`, { shouldNotScroll: true } );
				}

				togglePopover( source, type, _id );
			} }>
			<ElementTitle>{ title }</ElementTitle>
			<Content hex={ hex }>
				<HexString>{ hex }</HexString>
			</Content>
		</ElementWrapper>
	);
};

export default Color;
