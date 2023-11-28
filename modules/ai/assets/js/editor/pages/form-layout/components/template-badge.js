import { useState, useRef } from 'react';
import {
	Chip as ChipBase,
	Box,
	Typography,
	styled,
	Popper,
	Button,
	Paper, IconButton, Stack,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import LockIcon from '../../../icons/lock-icon';

const popoverId = 'e-pro-upgrade-popover';

const StyledContent = styled( Paper )( ( { theme } ) => ( {
	position: 'relative',
	padding: theme.spacing( 3 ),
	boxShadow: theme.shadows[ 4 ],
	zIndex: '9999',
} ) );

const StyledArrow = styled( Box )( ( { theme } ) => ( {
	position: 'absolute',
	width: theme.spacing( 3 ),
	height: theme.spacing( 2.5 ),
	overflow: 'hidden',
	// Override Popper inline styles.
	insetInlineEnd: `-19px !important`,
	marginTop: theme.spacing( -2 ),
	rotate: '270deg',
	'&::after': {
		backgroundColor: theme.palette.background.paper,
		content: '""',
		display: 'block',
		position: 'absolute',
		width: theme.spacing( 2.5 ),
		height: theme.spacing( 2.5 ),
		top: 0,
		left: '50%',
		transform: 'translateX(-50%) translateY(-50%) rotate(45deg)',
		boxShadow: '1px 1px 5px 0px rgba(0, 0, 0, 0.2)',
		backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
	},
} ) );

const Chip = styled( ChipBase )( () => ( {
	'& .MuiChip-label': {
		lineHeight: 1.5,
	},
	'& .MuiSvgIcon-root.MuiChip-icon': {
		fontSize: '1.25rem',
	},
} ) );

const TemplateBadge = ( {
	type = '',
	hasSubscription = false,
	usagePercentage = 0,
} ) => {
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const anchorEl = useRef( null );
	const arrowEl = useRef( null );

	const showPopover = () => setIsPopoverOpen( true );

	const hidePopover = () => setIsPopoverOpen( false );

	let actionUrl = 'https://go.elementor.com/ai-popup-purchase-dropdown/';
	if ( hasSubscription ) {
		actionUrl = usagePercentage >= 100 ? 'https://go.elementor.com/ai-popup-upgrade-limit-reached/' : 'https://go.elementor.com/ai-popup-upgrade-limit-reached-80-percent/';
	}
	const actionLabel = __( 'Go Pro', 'elementor' );

	switch ( type ) {
		case 'Pro':
			return (
				<Box
					flexDirection="row-reverse"
					component="span"
					display="flex"
					onMouseLeave={ hidePopover }
					alignItems="center"
				>
					<IconButton
						color="accent"
						ref={ anchorEl }
						onMouseEnter={ showPopover }
						aria-owns={ isPopoverOpen ? popoverId : undefined }
						aria-haspopup="true"
						sx={ {
							backgroundColor: ( theme ) => theme.palette.secondary.main,
							'&:hover': {
								backgroundColor: ( theme ) => theme.palette.action.selected,
							},
						} }
					>
						<LockIcon
							color="accent"
						/>
					</IconButton>

					<Popper
						open={ isPopoverOpen }
						popperOptions={ {
							placement: 'left-start',
							modifiers: [
								{
									name: 'arrow',
									enabled: true,
									options: {
										element: arrowEl.current,
										padding: 5,
									},
								},
								{
									name: 'offset',
									options: {
										offset: [ 0, 10 ],
									},
								},
							],
						} }
						anchorEl={ anchorEl.current }
						sx={ { zIndex: '9999', maxWidth: 300 } }
					>
						<StyledContent>
							<StyledArrow ref={ arrowEl } />

							<Stack
								alignItems="start"
								spacing={ 2 }

							>
								<Chip
									color="accent"
									variant="outlined"
									size="small"
									label={ __( 'Pro', 'elementor' ) }
									icon={ <LockIcon /> }
								/>

								<Typography
									variant="body2"
								>
									{ __( "This result includes the Elementor Pro widgets that's not available in your plan. Upgrade to use all the widgets in this result.", 'elementor' ) }
								</Typography>

								<Button
									variant="contained"
									color="accent"
									size="small"
									href={ actionUrl }
									target="_blank"
									sx={ {
										alignSelf: 'flex-end',
										'&:hover': {
											color: 'accent.contrastText',
										},
									} }
								>
									{ actionLabel }
								</Button>
							</Stack>
						</StyledContent>
					</Popper>
				</Box>
			);
	}

	return null;
};

export default TemplateBadge;

TemplateBadge.propTypes = {
	type: PropTypes.string,
	hasSubscription: PropTypes.bool,
	usagePercentage: PropTypes.number,
};
