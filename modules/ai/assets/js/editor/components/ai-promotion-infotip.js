import { Tooltip, Popper, styled } from '@elementor/ui';

const StyledPopper = styled( Popper )( ( { theme } ) => ( {
	'& .MuiTooltip-tooltip': {
		width: 500,
		minHeight: 50,
		padding: 0,
		backgroundColor: theme.palette.background.paper,
		color: theme.palette.text.primary,
		// The shadow angle should guarantee that the arrow is visible clearly.
		boxShadow:
			'0px -6px 10px 2px rgba(0,0,0,0.025),6px 0px 10px 2px rgba(0,0,0,0.025),-6px 0px 10px 2px rgba(0,0,0,0.025),0px 6px 10px 2px rgba(0,0,0,0.025)',
	},
	'& .MuiTooltip-arrow': {
		color: theme.palette.background.paper,
		// Arrow size.
		fontSize: '1.2rem',
	},
	'&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom': {
		marginTop: theme.spacing( 2 ),
	},
	'&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementRight': {
		marginLeft: theme.spacing( 2 ),
	},
	'&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementLeft': {
		marginRight: theme.spacing( 2 ),
	},
	'&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop': {
		marginBottom: theme.spacing( 2 ),
	},
} ) );

export default function AiPromotionInfotip( { anchor, content, focusOutListener, placement, offset = { x: 0, y: 0 } } ) {
	const positionRef = React.useRef( {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	} );
	const popperRef = React.useRef( null );

	const showTooltip = () => {
		const { x, y, width, height } = anchor.getBoundingClientRect();

		positionRef.current = { x: x + offset.x, y: y + offset.y, width, height };

		if ( null === popperRef.current ) {
			return;
		}

		popperRef.current.update();
	};

	React.useEffect( () => {
		showTooltip();
	}, [] );

	return (
		<Tooltip
			arrow
			open={ true }
			title={ content }
			placement={ placement || 'left' }
			PopperComponent={ StyledPopper }
			PopperProps={ {
				onClick: () => focusOutListener.reset(),
				popperRef,
				anchorEl: {
					getBoundingClientRect: () => {
						return new DOMRect(
							positionRef.current.x,
							positionRef.current.y,
							positionRef.current.width,
							positionRef.current.height,
						);
					},
				},
			} }
		>
			<div style={ { display: 'none' } }></div>
		</Tooltip>
	);
}

AiPromotionInfotip.propTypes = {
	anchor: PropTypes.object.isRequired,
	content: PropTypes.object.isRequired,
	focusOutListener: PropTypes.object.isRequired,
	placement: PropTypes.string,
	offset: PropTypes.object,
};
