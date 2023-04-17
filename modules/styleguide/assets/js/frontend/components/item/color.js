import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import DivBase from '../global/div-base';
import ElementTitle from '../global/element-title';
import ElementWrapper from '../global/element-wrapper';
import { useActiveContext } from '../../contexts/active-context';

const Content = styled( DivBase )`
	display: flex;
	width: 100%;
	height: 100px;
	background-color: ${ ( props ) => props.hex };
	border: 1px solid var(--e-a-border-color-focus);
	border-radius: 3px;
	align-items: end;
`;

const HexString = styled.p`
	color: var(--e-a-color-txt-invert);
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

export default function Color( props ) {
	const { activeElement, activateElement, getElementControl } = useActiveContext();

	const { item, type } = props;

	const source = 'color';
	const { _id, title, color: hex } = item;

	const elementControl = getElementControl( type, source, _id );
	const ref = useRef( null );

	useEffect( () => {
		if ( elementControl === activeElement ) {
			ref.current.scrollIntoView( {
				behavior: 'smooth',
				block: 'center',
				inline: 'center',
			} );
		}
	}, [ activeElement ] );

	const onClick = () => {
		activateElement( type, source, _id );
	};

	return (
		<ElementWrapper
			columns={ props.columns }
			ref={ ref }
			isActive={ elementControl === activeElement }
			onClick={ onClick }
		>
			<ElementTitle>{ title }</ElementTitle>
			<Content hex={ hex }>
				<HexString>{ hex }</HexString>
			</Content>
		</ElementWrapper>
	);
}

Color.propTypes = {
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
