import React from 'react';
import styled, { css } from 'styled-components';
import DivBase from './div-base';

const Wrapper = styled( DivBase )`
	display: flex;
	flex-direction: column;
	gap: 12px;
	align-items: flex-start;
	border: 1px solid transparent;
	border-radius: 3px;
	padding: 12px;
	cursor: pointer;
	${ ( { columns } ) => {
		const columnWidth = 100 / ( columns.desktop ?? 1 );

		return css`
			flex: 0 0 ${ columnWidth }%;
		`;
	} }

	&:hover:not(.active) {
		background-color: var(--e-a-bg-hover);
		border-color: var(--e-a-border-color-bold);
	}

	&.active {
		background-color: var(--e-a-bg-active);
		border-color: var(--e-a-border-color-accent);
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
