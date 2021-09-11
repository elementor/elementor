import styled, { css } from 'styled-components';

const Grid = styled.div`
	${ ( props ) => props.container && css`
		width: 100%;
		display: flex;
		flex-wrap: ${ props.noWrap && 'nowrap' || props.wrapReverse && 'wrap-reverse' || 'wrap' };

		${ ( props ) => bindProps( [
			{ 'padding': spacing( props.spacing ) },
			{ 'flex-direction': props.direction },
			{ 'justify-content': props.justify },
			{ 'align-items': props.alignItems },
			{ 'align-content': props.alignContent },
			{ 'min-width': props.zeroMinWidth && '0' },
		] ) }
	` }
`;

export const StyledGrid = ( props ) => (
	<Grid { ...props }>{ props.children }</Grid>
);

StyledGrid.propTypes = {
	children: PropTypes.any,
	//justify: PropTypes.oneOf( [ 'flex-start', 'center', 'flex-end', 'space-betwen' ] ),
};
