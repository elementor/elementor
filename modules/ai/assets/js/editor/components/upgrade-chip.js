import { useState, useRef } from 'react';
import {
	Chip as ChipBase,
	Box,
	Typography,
	styled,
	Popper,
	Button,
	List,
	ListItem,
	ListItemText,
	ListItemIcon,
	Paper,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { CheckedCircleIcon, AIIcon } from '@elementor/icons';

const popoverId = 'e-ai-upgrade-popover';

const StyledContent = styled( Paper )( ( { theme } ) => ( {
	position: 'relative',
	'[data-popper-placement="top"] &': {
		marginBottom: theme.spacing( 2.5 ),
	},
	'[data-popper-placement="bottom"] &': {
		marginTop: theme.spacing( 2.5 ),
	},
	padding: theme.spacing( 3 ),
	boxShadow: theme.shadows[ 4 ],
	zIndex: '9999',
} ) );

const StyledArrow = styled( Box )( ( { theme } ) => ( {
	width: theme.spacing( 5 ),
	height: theme.spacing( 2.5 ),
	position: 'absolute',
	overflow: 'hidden',
	// Override Popper inline styles.
	left: '50% !important',
	transform: 'translateX(-50%) rotate(var(--rotate, 0deg)) !important',
	'[data-popper-placement="top"] &': {
		top: '100%',
	},
	'[data-popper-placement="bottom"] &': {
		'--rotate': '180deg',
		top: `calc(${ theme.spacing( 2.5 ) } * -1)`,
	},
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

const upgradeBullets = [
	__( 'Get spot-on suggestions from AI Copilot and AI Context with appropriate designs, layouts, and content for your business.', 'elementor' ),
	__( 'Generate professional texts about any topic, in any tone.', 'elementor' ),
	__( 'Effortlessly create or enhance stunning images and bring your ideas to life.', 'elementor' ),
	__( 'Unleash infinite possibilities with the custom code generator.', 'elementor' ),
	__( 'Access 30-days of AI History with the AI Starter plan and 90-days with the Power plan.', 'elementor' ),
];

const Chip = styled( ChipBase )( () => ( {
	'& .MuiChip-label': {
		lineHeight: 1.5,
	},
	'& .MuiSvgIcon-root.MuiChip-icon': {
		fontSize: '1.25rem',
	},
} ) );

const UpgradeChip = ( {
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
	const actionLabel = hasSubscription ? __( 'Upgrade Elementor AI', 'elementor' ) : __( 'Get Elementor AI', 'elementor' );

	return (
		<Box
			component="span"
			aria-owns={ isPopoverOpen ? popoverId : undefined }
			aria-haspopup="true"
			onMouseEnter={ showPopover }
			onMouseLeave={ hidePopover }
			ref={ anchorEl }
			display="flex"
			alignItems="center"
		>
			<Chip color="promotion" label={ __( 'Upgrade', 'elementor' ) }
				icon={ <AIIcon /> } size="small" />

			<Popper
				open={ isPopoverOpen }
				anchorEl={ anchorEl.current }
				sx={ { zIndex: '170001', maxWidth: 300 } }
				modifiers={ [ {
					name: 'arrow',
					enabled: true,
					options: {
						element: arrowEl.current,
					},
				} ] }
			>
				<StyledContent>
					<StyledArrow ref={ arrowEl } />

					<Typography variant="h5" color="text.primary">
						{ __( 'Unlimited access to Elementor AI', 'elementor' ) }
					</Typography>

					<List sx={ { mb: 1 } }>
						{
							upgradeBullets.map( ( bullet, index ) => (
								<ListItem key={ index } disableGutters sx={ { alignItems: 'flex-start' } }>
									<ListItemIcon>
										<CheckedCircleIcon />
									</ListItemIcon>
									<ListItemText sx={ { m: 0 } }>
										<Typography variant="body2">{ bullet }</Typography>
									</ListItemText>
								</ListItem>
							) )
						}
					</List>

					<Button
						variant="contained"
						color="promotion"
						size="small"
						href={ actionUrl }
						target="_blank"
						startIcon={ <AIIcon /> }
						sx={ {
							'&:hover': {
								color: 'promotion.contrastText',
							},
						} }
					>
						{ actionLabel }
					</Button>
				</StyledContent>
			</Popper>
		</Box>
	);
};

export default UpgradeChip;

UpgradeChip.propTypes = {
	hasSubscription: PropTypes.bool,
	usagePercentage: PropTypes.number,
};
