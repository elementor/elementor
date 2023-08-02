import { Box, styled } from '@elementor/ui';

const OuterWrapper = styled( Box )( ( { theme, selected, height } ) => {
	const outline = `${ theme.border.size.sm } ${ theme.border.style.solid } ${ theme.palette.text.primary }`;

	return {
		height,
		cursor: 'pointer',
		overflow: 'hidden',
		boxSizing: 'border-box',
		borderRadius: theme.border.size.md,
		border: `4px solid ${ theme.palette.background.paper }`,
		outline: selected ? outline : 'none',
		transition: `all ${ theme.transitions.duration.standard }ms linear`,
		'&:hover': {
			outline,
		},
	};
} );

const InnerWrapper = styled( Box )( ( { theme } ) => ( {
	height: '100%',
	borderRadius: theme.border.size.md,
	backgroundColor: theme.palette.common.white,
} ) );

const ScreenshotContainer = ( { children, ...props } ) => {
	return (
		<OuterWrapper { ...props }>
			<InnerWrapper>
				{ children }
			</InnerWrapper>
		</OuterWrapper>
	);
};

ScreenshotContainer.propTypes = {
	children: PropTypes.node,
};

export default ScreenshotContainer;
