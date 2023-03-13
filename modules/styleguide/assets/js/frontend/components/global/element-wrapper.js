import React, { useEffect } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	align-items: flex-start;
	border: 1px solid transparent;
	padding: 12px;
	flex-grow: 1;
	flex-basis: ${ ( props ) => 'font' === props.type ? '100%' : '25%' };
	max-width: ${ ( props ) => 'font' === props.type ? '100%' : '25%' };

	&.active {
		cursor: pointer;
		border-color: #424344;
		border-radius: 3px;
		background-color: #F1F2F3;
	}

	&:hover:not(.active) {
		cursor: pointer;
		border-color: #D5DADF;
		border-radius: 3px;
		background-color: #F9FAFA;
	}

	@media (max-width: 767px) {
		flex-basis: ${ ( props ) => 'font' === props.type ? '100%' : '50%' };
		max-width: ${ ( props ) => 'font' === props.type ? '100%' : '50%' };
	}
`;

const ElementWrapper = React.forwardRef( ( props, ref ) => {
	const { isActive, children } = props;

	return (
		<Wrapper { ...props }
			ref={ ref }
			className={ isActive ? 'active' : '' }
		>{ children }</Wrapper>
	);
} );

export default ElementWrapper;
