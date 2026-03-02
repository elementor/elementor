import * as React from 'react';
import { useSuppressedMessage } from '@elementor/editor-current-user';
import { XIcon } from '@elementor/icons';
import {
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	Fade,
	type FadeProps,
	IconButton,
	Stack,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const ANGIE_INTRO_MESSAGE_KEY = 'angie-components-intro';
const INTRO_IMAGE_URL = 'https://assets.elementor.com/packages/v1/images/angie-components-intro.png';

type AngieIntroModalProps = {
	onClose: () => void;
	onConfirm: () => void;
};

export const AngieIntroModal = ( { onClose, onConfirm }: AngieIntroModalProps ) => {
	return (
		<Dialog
			open
			onClose={ onClose }
			maxWidth="xs"
			TransitionComponent={ Transition }
			PaperProps={ { sx: { width: 296, maxWidth: 296 } } }
		>
			<Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 } }>
				<Stack direction="row" alignItems="center" gap={ 1 }>
					<Typography variant="subtitle2">{ __( 'Meet Angie', 'elementor' ) }</Typography>
					<Chip label={ __( 'New', 'elementor' ) } color="info" size="small" />
				</Stack>
				<IconButton size="small" onClick={ onClose } aria-label={ __( 'Close', 'elementor' ) }>
					<XIcon fontSize="small" />
				</IconButton>
			</Box>

			<DialogContent sx={ { p: 0 } }>
				<Box
					component="img"
					src={ INTRO_IMAGE_URL }
					alt=""
					sx={ {
						width: '100%',
						height: 148,
						objectFit: 'cover',
						backgroundColor: 'action.hover',
					} }
				/>
				<Box sx={ { px: 2, py: 1 } }>
					<Typography variant="body2" color="text.secondary">
						{ __( 'You can now generate custom components using Angie', 'elementor' ) }
					</Typography>
				</Box>
			</DialogContent>

			<DialogActions sx={ { justifyContent: 'flex-end', px: 2, pb: 1.5, pt: 1 } }>
				<Button variant="contained" color="primary" size="small" onClick={ onConfirm }>
					{ __( "Let's Try", 'elementor' ) }
				</Button>
			</DialogActions>
		</Dialog>
	);
};

const Transition = React.forwardRef( ( props: FadeProps, ref: React.Ref< unknown > ) => (
	<Fade
		ref={ ref }
		{ ...props }
		timeout={ {
			enter: 500,
			exit: 200,
		} }
	/>
) );

export const useAngieIntroModal = () => {
	const [ isMessageSuppressed, suppressMessage ] = useSuppressedMessage( ANGIE_INTRO_MESSAGE_KEY );

	return {
		shouldShowIntro: ! isMessageSuppressed,
		suppressIntro: suppressMessage,
	};
};
