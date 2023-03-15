import React from 'react';
import styled, { css } from 'styled-components';

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	align-items: flex-start;
	border: 1px solid transparent;
	padding: 12px;
	${ ( { columns } ) => {
		const columnWidth = 100 / ( columns.desktop ?? 1 );

		return css`
			flex: 0 0 ${ columnWidth }%;
		`;
	} }

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
		${ ( { columns } ) => {
			const columnWidth = 100 / ( columns.mobile ?? 1 );

			return css`
				flex: 0 0 ${ columnWidth }%;
			`;
		} }
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

ElementWrapper.propTypes = {
	isActive: PropTypes.bool,
	children: PropTypes.oneOfType( [
		PropTypes.node,
		PropTypes.arrayOf( PropTypes.node ),
	] ),
};
