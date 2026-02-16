import * as React from 'react';
import { useState } from 'react';
import { AlertOctagonFilledIcon } from '@elementor/icons';
import {
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	type DialogContentTextProps,
	type DialogProps,
	DialogTitle,
	FormControlLabel,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const TITLE_ID = 'confirmation-dialog';

type ConfirmationDialogProps = Pick< DialogProps, 'open' | 'onClose' | 'children' >;

export const ConfirmationDialog = ( { open, onClose, children }: ConfirmationDialogProps ) => (
	<Dialog open={ open } onClose={ onClose } aria-labelledby={ TITLE_ID } maxWidth="sm">
		{ children }
	</Dialog>
);

type ConfirmationDialogTitleProps = React.PropsWithChildren< {
	icon?: React.ElementType;
	iconColor?: 'error' | 'secondary' | 'primary';
} >;

const ConfirmationDialogTitle = ( {
	children,
	icon: Icon = AlertOctagonFilledIcon,
	iconColor = 'error',
}: ConfirmationDialogTitleProps ) => (
	<DialogTitle id={ TITLE_ID } display="flex" alignItems="center" gap={ 1 } sx={ { lineHeight: 1 } }>
		<Icon color={ iconColor } />
		{ children }
	</DialogTitle>
);

const ConfirmationDialogContent = ( { children }: React.PropsWithChildren ) => (
	<DialogContent sx={ { mt: 2 } }>{ children }</DialogContent>
);

const ConfirmationDialogContentText = ( props: DialogContentTextProps ) => (
	<DialogContentText variant="body2" color="secondary" { ...props } />
);

type ConfirmationDialogActionsProps = {
	onClose: () => void;
	onConfirm: () => void;
	cancelLabel?: string;
	confirmLabel?: string;
	color?: 'error' | 'secondary' | 'primary';
	onSuppressMessage?: () => void;
	suppressLabel?: string;
};

const ConfirmationDialogActions = ( {
	onClose,
	onConfirm,
	cancelLabel,
	confirmLabel,
	color = 'error',
	onSuppressMessage,
	suppressLabel = __( "Don't show this again", 'elementor' ),
}: ConfirmationDialogActionsProps ) => {
	const [ dontShowAgain, setDontShowAgain ] = useState( false );

	const handleConfirm = () => {
		if ( dontShowAgain && onSuppressMessage ) {
			onSuppressMessage();
		}
		onConfirm();
	};

	return (
		<DialogActions sx={ onSuppressMessage ? { justifyContent: 'space-between', alignItems: 'center' } : undefined }>
			{ onSuppressMessage && (
				<FormControlLabel
					control={
						<Checkbox
							checked={ dontShowAgain }
							onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
								setDontShowAgain( event.target.checked )
							}
							size="medium"
							color="secondary"
						/>
					}
					label={ <Typography variant="body2" color="text.secondary">{ suppressLabel }</Typography> }
				/>
			) }
			<div>
				<Button color="secondary" onClick={ onClose }>
					{ cancelLabel ?? __( 'Not now', 'elementor' ) }
				</Button>
				{ /* eslint-disable-next-line jsx-a11y/no-autofocus */ }
				<Button autoFocus variant="contained" color={ color } onClick={ handleConfirm } sx={ { ml: 1 } }>
					{ confirmLabel ?? __( 'Delete', 'elementor' ) }
				</Button>
			</div>
		</DialogActions>
	);
};

ConfirmationDialog.Title = ConfirmationDialogTitle;
ConfirmationDialog.Content = ConfirmationDialogContent;
ConfirmationDialog.ContentText = ConfirmationDialogContentText;
ConfirmationDialog.Actions = ConfirmationDialogActions;
