import React, { useRef, useEffect, useContext, useState } from 'react';
import styled from 'styled-components';
import ElementTitle from '../global/element-title';
import ElementWrapper from '../global/element-wrapper';
import { ActiveContext } from '../../contexts/active-context';

const Content = styled.div`
	display: flex;
	width: 100%;
	height: 100px;
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

export default function Color( props ) {
	const { activeElement, isActiveElement, activateElement } = useContext( ActiveContext );
	const [ isActive, setIsActive ] = useState( false );

	const { item, type } = props;

	const source = 'colors';
	const { _id, title, color: hex } = item;

	const ref = useRef( null );

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

	const onClick = () => {
		activateElement( type, source, _id );

		const route = 'panel/global/global-colors';

		if ( ! window.top.$e.routes.is( route ) ) {
			window.top.$e.run( `${ route }/route`, { shouldNotScroll: true } );
		}

		// togglePopover( source, type, _id );
	};

	return (
		<ElementWrapper
			columns={ props.columns }
			ref={ ref }
			isActive={ isActive }
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
