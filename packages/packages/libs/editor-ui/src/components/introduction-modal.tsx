import * as React from 'react';
import { useState } from 'react';
import {
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogHeader,
	DialogTitle,
	Fade,
	type FadeProps,
	FormControlLabel,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type IntroductionModalProps = React.PropsWithChildren< {
	open: boolean;
	handleClose: ( shouldShowAgain: boolean ) => void;
	title?: string;
} >;

export const IntroductionModal = ( { open, handleClose, title, children }: IntroductionModalProps ) => {
	const [ shouldShowAgain, setShouldShowAgain ] = useState( true );

	return (
		<Dialog open={ open } onClose={ handleClose } maxWidth={ 'sm' } TransitionComponent={ Transition }>
			{ title && (
				<DialogHeader logo={ false }>
					<DialogTitle>{ title }</DialogTitle>
				</DialogHeader>
			) }
			{ children }
			<DialogActions>
				<FormControlLabel
					sx={ { marginRight: 'auto' } }
					control={
						<Checkbox
							checked={ ! shouldShowAgain }
							onChange={ () => setShouldShowAgain( ! shouldShowAgain ) }
						/>
					}
					label={
						<Typography variant={ 'body2' }>{ __( "Don't show this again", 'elementor' ) }</Typography>
					}
				/>
				<Button
					size={ 'medium' }
					variant="contained"
					sx={ { minWidth: '135px' } }
					onClick={ () => handleClose( shouldShowAgain ) }
				>
					{ __( 'Got it', 'elementor' ) }
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
			enter: 1000,
			exit: 200,
		} }
	/>
) );
