import styled, { css } from 'styled-components';
import _$ from 'elementor-styles';

const Grid = styled.div`
	${ ( props ) => props.container && css`
		width: 100%;
		display: flex;
		flex-wrap: ${ props.noWrap && 'nowrap' || props.wrapReverse && 'wrap-reverse' || 'wrap' };

		${ ( props ) => _$.utils.bindProps( [
			{ 'padding': _$.spacing( props.spacing ) },
			{ 'flex-direction': props.direction },
			{ 'justify-content': props.justify },
			{ 'align-items': props.alignItems },
			{ 'align-content': props.alignContent },
			{ 'min-width': props.zeroMinWidth && '0' },
		] ) }
	` }

	${ ( props ) => props.item && css`
		flex-grow: 0;
	` }

	${ ( props ) => {
		const breakpoints = _$.breakpoints();

		for ( const key in breakpoints ) {
			console.log( 'breakpoint', key );
		}
	} }
`;

export const StyledGrid = ( props ) => (
	<Grid { ...props }>{ props.children }</Grid>
);

StyledGrid.propTypes = {
	children: PropTypes.any,
	justify: PropTypes.oneOf( [ 'flex-start', 'center', 'flex-end' ] ),
};
