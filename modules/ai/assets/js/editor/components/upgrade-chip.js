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
} from '@elementor/ui';
import { UpgradeIcon, CheckedCircleIcon } from '@elementor/icons';

const popoverId = 'e-ai-upgrade-popover';

const StyledContent = styled( Box )( ( { theme } ) => ( {
	position: 'relative',
	marginTop: theme.spacing( 7 ),
	padding: theme.spacing( 7 ),
	backgroundColor: theme.palette.background.paper,
	boxShadow: theme.shadows[ 4 ],
	borderRadius: theme.border.radius.sm,
	zIndex: '9999',
} ) );

const StyledArrow = styled( Box )( ( { theme } ) => ( {
	width: theme.sizing[ 500 ],
	height: theme.sizing[ 200 ],
	position: 'absolute',
	top: `calc(${ theme.sizing[ 200 ] } * -1)`,
	left: '50%',
	transform: 'translateX(-50%) rotate(180deg)',
	overflow: 'hidden',
	'&::after': {
		backgroundColor: theme.palette.background.paper,
		content: '""',
		display: 'block',
		position: 'absolute',
		width: theme.sizing[ 200 ],
		height: theme.sizing[ 200 ],
		top: 0,
		left: '50%',
		transform: 'translateX(-50%) translateY(-50%) rotate(45deg)',
		boxShadow: '1px 1px 5px 0px rgba(0, 0, 0, 0.2)',
	},
} ) );

const upgradeBullets = [
	__( 'Generate professional texts about any topic, in any tone.', 'elementor' ),
	__( 'Translate your content into twenty-five different languages.', 'elementor' ),
	__( 'Unleash infinite possibilities with the custom code generator.', 'elementor' ),
];

const Chip = styled( ChipBase )( () => ( {
	'& .MuiChip-label': {
		lineHeight: 1.5,
	},
	'& .MuiSvgIcon-root.MuiChip-icon': {
		fontSize: '1.25rem',
	},
} ) );

const UpgradeChip = () => {
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const anchorEl = useRef( null );

	const showPopover = () => setIsPopoverOpen( true );

	const hidePopover = () => setIsPopoverOpen( false );

	return (
		<Box
			component="span"
			aria-owns={ isPopoverOpen ? popoverId : undefined }
			aria-haspopup="true"
			onMouseEnter={ showPopover }
			onMouseLeave={ hidePopover }
			ref={ anchorEl }
		>
			<Chip color="accent" label={ __( 'Upgrade', 'elementor' ) } icon={ <UpgradeIcon /> } />

			<Popper
				open={ isPopoverOpen }
				anchorEl={ anchorEl.current }
				sx={ { zIndex: '9999', maxWidth: 300 } }
			>
				<StyledContent>
					<StyledArrow />

					<Typography variant="h5" color="text.primary">
						{ __( 'Unlimited access to Elementor AI', 'elementor' ) }
					</Typography>

					<List sx={ { mb: 7 } }>
						{
							upgradeBullets.map( ( bullet, index ) => (
								<ListItem key={ index } disableGutters sx={ { alignItems: 'flex-start', my: 4 } }>
									<ListItemIcon sx={ { mr: 3 } }>
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
						color="accent"
						size="small"
						href="https://go.elementor.com/ai-popup-purchase-dropdown/"
						target="_blank"
						startIcon={ <UpgradeIcon /> }
						sx={ {
							'&:hover': {
								color: 'accent.contrastText',
							},
						} }
					>
						{ __( 'Get Elementor AI', 'elementor' ) }
					</Button>
				</StyledContent>
			</Popper>
		</Box>
	);
};

export default UpgradeChip;
