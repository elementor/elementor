import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	align-items: flex-start;
	padding: 12px;

	&.active {
		cursor: pointer;
		border: 1px solid #424344;
		border-radius: 3px;
		margin: -1px;
		background-color: #F1F2F3;
	}

	&:hover:not(.active) {
		cursor: pointer;
		border: 1px solid #D5DADF;
		border-radius: 3px;
		margin: -1px;
		background-color: #F9FAFA;
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
