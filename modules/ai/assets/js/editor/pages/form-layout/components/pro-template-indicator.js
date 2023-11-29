import { __ } from '@wordpress/i18n';
import { Box, Button, Chip, IconButton, Paper, Popper, Stack, styled, Typography } from '@elementor/ui';
import LockIcon from '../../../icons/lock-icon';
import { useRef, useState } from 'react';

const popoverId = 'e-pro-upgrade-popover';

const StyledContent = styled( Paper )( ( { theme } ) => ( {
	position: 'relative',
	padding: theme.spacing( 3 ),
	boxShadow: theme.shadows[ 4 ],
	zIndex: '9999',
} ) );

const StyledArrow = styled( Box )( ( { theme } ) => ( {
	position: 'absolute',
	width: theme.spacing( 5 ),
	height: theme.spacing( 5 ),
	overflow: 'hidden',
	// Override Popper inline styles.
	left: '100% !important',
	transform: 'translateX(-50%) translateY(-50%) rotate(var(--rotate, 0deg)) !important',
	'&::after': {
		backgroundColor: theme.palette.background.paper,
		content: '""',
		display: 'block',
		position: 'absolute',
		width: theme.spacing( 2.5 ),
		height: theme.spacing( 2.5 ),
		top: '50%',
		left: '50%',
		transform: 'translateX(-50%) translateY(-50%) rotate(45deg)',
		boxShadow: '5px -5px 5px 0px rgba(0, 0, 0, 0.2)',
		backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
	},
} ) );

export const ProTemplateIndicator = () => {
	const actionUrl = 'https://go.elementor.com/go-pro-ai/';
	const actionLabel = __( 'Go Pro', 'elementor' );

	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const anchorEl = useRef( null );
	const arrowEl = useRef( null );

	const showPopover = () => setIsPopoverOpen( true );

	const hidePopover = () => setIsPopoverOpen( false );

	return (
		<Box
			flexDirection="row-reverse"
			component="span"
			display="flex"
			onMouseLeave={ hidePopover }
			alignItems="center"
		>
			<IconButton
				ref={ anchorEl }
				onMouseEnter={ showPopover }
				onClick={ ( e ) => e.stopPropagation() /* Do nothing */ }
				aria-owns={ isPopoverOpen ? popoverId : undefined }
				aria-haspopup="true"
				sx={ {
					m: 1,
					'&:hover': {
						backgroundColor: 'action.selected',
					},
				} }
			>
				<LockIcon
					sx={ {
						color: 'text.primary',
					} }
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
							{ __( "This result includes an Elementor Pro widget that's not available with your current plan. Upgrade to use all the widgets in this result.", 'elementor' ) }
						</Typography>

						<Button
							variant="contained"
							color="accent"
							size="small"
							href={ actionUrl }
							target="_blank"
							sx={ {
								alignSelf: 'flex-end',
							} }
						>
							{ actionLabel }
						</Button>
					</Stack>
				</StyledContent>
			</Popper>
		</Box>
	);
};
