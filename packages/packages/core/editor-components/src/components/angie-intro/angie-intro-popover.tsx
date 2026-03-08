import * as React from 'react';
import type { RefObject } from 'react';
import { useSuppressedMessage } from '@elementor/editor-current-user';
import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	CardMedia,
	Chip,
	ClickAwayListener,
	CloseButton,
	Infotip,
	type InfotipProps,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const ANGIE_INTRO_MESSAGE_KEY = 'angie-components-intro';
const INTRO_IMAGE_URL = 'https://assets.elementor.com/packages/v1/images/angie-components-promotion.png';
const IMAGE_OVERLAY_COLOR = 'rgba(255, 0, 191, 0.6)';
const BUTTON_COLOR = '#f0abfc';
const BUTTON_HOVER_COLOR = '#e879f9';
const BUTTON_TEXT_COLOR = '#0c0d0e';

type AngieIntroPopoverProps = {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	anchorRef: RefObject< HTMLElement | null >;
};

export const AngieIntroPopover = ( { open, onClose, onConfirm, anchorRef }: AngieIntroPopoverProps ) => {
	const anchorEl = anchorRef?.current;

	const slotProps: InfotipProps[ 'slotProps' ] = anchorEl
		? {
				popper: {
					anchorEl,
					modifiers: [
						{
							name: 'offset',
							options: {
								offset: [ -40, 8 ],
							},
						},
					],
				},
		  }
		: undefined;

	const handleClose = ( e: MouseEvent ) => {
		e.stopPropagation();
		onClose();
	};

	return (
		<Infotip
			placement="right-start"
			content={ <AngieIntroCard onClose={ handleClose } onConfirm={ onConfirm } /> }
			open={ open }
			slotProps={ slotProps }
		>
			<span />
		</Infotip>
	);
};

type AngieIntroCardProps = {
	onClose: ( e: MouseEvent ) => void;
	onConfirm: () => void;
};

function AngieIntroCard( { onClose, onConfirm }: AngieIntroCardProps ) {
	return (
		<ClickAwayListener
			disableReactTree={ true }
			mouseEvent="onMouseDown"
			touchEvent="onTouchStart"
			onClickAway={ onClose }
		>
			<Card elevation={ 0 } sx={ { width: 296, borderRadius: '4px' } }>
				<CardHeader
					title={
						<Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
							<Typography variant="subtitle2">{ __( 'Meet Angie', 'elementor' ) }</Typography>
							<Chip
								label={ __( 'New', 'elementor' ) }
								size="small"
								sx={ {
									height: 24,
									fontSize: '13px',
									backgroundColor: '#ebf2fe',
									color: '#1945a4',
									borderRadius: '1000px',
								} }
							/>
						</Box>
					}
					action={ <CloseButton slotProps={ { icon: { fontSize: 'tiny' } } } onClick={ onClose } /> }
					sx={ { py: 1, px: 2 } }
				/>
				<Box sx={ { position: 'relative', width: '100%', height: 148 } }>
					<CardMedia
						component="img"
						image={ INTRO_IMAGE_URL }
						alt=""
						sx={ {
							width: '100%',
							height: '100%',
							objectFit: 'cover',
						} }
					/>
					<Box
						sx={ {
							position: 'absolute',
							inset: 0,
							backgroundColor: IMAGE_OVERLAY_COLOR,
							pointerEvents: 'none',
						} }
					/>
				</Box>
				<CardContent sx={ { px: 2, py: 1 } }>
					<Typography variant="body2" color="text.secondary">
						{ __( 'Build components using simple instructions.', 'elementor' ) }
					</Typography>
				</CardContent>
				<CardActions sx={ { justifyContent: 'flex-end', px: 2, pb: 1.5, pt: 1 } }>
					<Button
						variant="contained"
						size="small"
						onClick={ onConfirm }
						sx={ {
							backgroundColor: BUTTON_COLOR,
							color: BUTTON_TEXT_COLOR,
							'&:hover': { backgroundColor: BUTTON_HOVER_COLOR },
						} }
					>
						{ __( 'Start building', 'elementor' ) }
					</Button>
				</CardActions>
			</Card>
		</ClickAwayListener>
	);
}

export const useAngieIntro = () => {
	const [ isMessageSuppressed, suppressMessage ] = useSuppressedMessage( ANGIE_INTRO_MESSAGE_KEY );

	return {
		shouldShowIntro: ! isMessageSuppressed,
		suppressIntro: suppressMessage,
	};
};
