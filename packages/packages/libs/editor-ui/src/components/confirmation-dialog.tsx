import * as React from 'react';
import { AlertOctagonFilledIcon } from '@elementor/icons';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	type DialogContentTextProps,
	type DialogProps,
	DialogTitle,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const TITLE_ID = 'confirmation-dialog';

type ConfirmationDialogProps = Pick< DialogProps, 'open' | 'onClose' | 'children' >;

export const ConfirmationDialog = ( { open, onClose, children }: ConfirmationDialogProps ) => (
	<Dialog open={ open } onClose={ onClose } aria-labelledby={ TITLE_ID } maxWidth="xs">
		{ children }
	</Dialog>
);

const ConfirmationDialogTitle = ( { children }: React.PropsWithChildren ) => (
	<DialogTitle id={ TITLE_ID } display="flex" alignItems="center" gap={ 1 } sx={ { lineHeight: 1 } }>
		<AlertOctagonFilledIcon color="error" />
		{ children }
	</DialogTitle>
);

const ConfirmationDialogContent = ( { children }: React.PropsWithChildren ) => (
	<DialogContent>{ children }</DialogContent>
);

const ConfirmationDialogContentText = ( props: DialogContentTextProps ) => (
	<DialogContentText variant="body2" color="textPrimary" { ...props } />
);

type ConfirmationDialogActionsProps = {
	onClose: () => void;
	onConfirm: () => void;
	cancelLabel?: string;
	confirmLabel?: string;
};

const ConfirmationDialogActions = ( {
	onClose,
	onConfirm,
	cancelLabel,
	confirmLabel,
}: ConfirmationDialogActionsProps ) => (
	<DialogActions>
		<Button color="secondary" onClick={ onClose }>
			{ cancelLabel ?? __( 'Not now', 'elementor' ) }
		</Button>
		{ /* eslint-disable-next-line jsx-a11y/no-autofocus */ }
		<Button autoFocus variant="contained" color="error" onClick={ onConfirm }>
			{ confirmLabel ?? __( 'Delete', 'elementor' ) }
		</Button>
	</DialogActions>
);

ConfirmationDialog.Title = ConfirmationDialogTitle;
ConfirmationDialog.Content = ConfirmationDialogContent;
ConfirmationDialog.ContentText = ConfirmationDialogContentText;
ConfirmationDialog.Actions = ConfirmationDialogActions;
