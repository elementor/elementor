import * as React from 'react';
import { useState } from 'react';
import { useSuppressedMessage } from '@elementor/editor-current-user';
import {
	Box,
	Button,
	Checkbox,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogHeader,
	DialogTitle,
	Fade,
	type FadeProps,
	FormControlLabel,
	Stack,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const ANGIE_INTRO_MESSAGE_KEY = 'angie-components-intro';
const INTRO_IMAGE_URL = 'https://assets.elementor.com/packages/v1/images/angie-components-intro.png';

type AngieIntroModalProps = {
	onClose: () => void;
	onConfirm: ( suppressFuture: boolean ) => void;
};

export const AngieIntroModal = ( { onClose, onConfirm }: AngieIntroModalProps ) => {
	const [ dontShowAgain, setDontShowAgain ] = useState( false );

	return (
		<Dialog open onClose={ onClose } maxWidth="xs" TransitionComponent={ Transition }>
			<DialogHeader sx={ { pb: 0 } }>
				<Stack direction="row" alignItems="center" gap={ 1 }>
					<DialogTitle>{ __( 'Meet Angie', 'elementor' ) }</DialogTitle>
					<Chip label={ __( 'New', 'elementor' ) } color="info" size="small" />
				</Stack>
			</DialogHeader>

			<DialogContent sx={ { px: 0, pt: 2 } }>
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
				<Box sx={ { px: 3, pt: 2 } }>
					<Typography variant="body2" color="text.secondary">
						{ __( 'You can now generate custom components using Angie', 'elementor' ) }
					</Typography>
				</Box>
			</DialogContent>

			<DialogActions sx={ { justifyContent: 'space-between' } }>
				<FormControlLabel
					control={
						<Checkbox
							checked={ dontShowAgain }
							onChange={ () => setDontShowAgain( ! dontShowAgain ) }
						/>
					}
					label={
						<Typography variant="body2">{ __( "Don't show this again", 'elementor' ) }</Typography>
					}
				/>
				<Button variant="contained" color="primary" onClick={ () => onConfirm( dontShowAgain ) }>
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
