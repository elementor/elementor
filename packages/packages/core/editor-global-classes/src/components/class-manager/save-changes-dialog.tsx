import * as React from 'react';
import { useState } from 'react';
import { AlertTriangleFilledIcon } from '@elementor/icons';
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

const TITLE_ID = 'save-changes-dialog';

const SaveChangesDialog = ( { children, onClose }: Pick< DialogProps, 'children' | 'onClose' > ) => (
	<Dialog open onClose={ onClose } aria-labelledby={ TITLE_ID } maxWidth="xs">
		{ children }
	</Dialog>
);

const SaveChangesDialogTitle = ( { children }: React.PropsWithChildren ) => (
	<DialogTitle id={ TITLE_ID } display="flex" alignItems="center" gap={ 1 } sx={ { lineHeight: 1 } }>
		<AlertTriangleFilledIcon color="secondary" />
		{ children }
	</DialogTitle>
);

const SaveChangesDialogContent = ( { children }: React.PropsWithChildren ) => (
	<DialogContent>{ children }</DialogContent>
);

const SaveChangesDialogContentText = ( props: DialogContentTextProps ) => (
	<DialogContentText variant="body2" color="textPrimary" display="flex" flexDirection="column" { ...props } />
);

type Action = {
	label: string;
	action: () => void | Promise< void >;
};

type ConfirmationDialogActionsProps = {
	actions: {
		cancel?: Action;
		confirm: Action;
		discard?: Action;
	};
};
const SaveChangesDialogActions = ( { actions }: ConfirmationDialogActionsProps ) => {
	const [ isConfirming, setIsConfirming ] = useState( false );
	const { cancel, confirm, discard } = actions;

	const onConfirm = async () => {
		setIsConfirming( true );
		await confirm.action();
		setIsConfirming( false );
	};
	return (
		<DialogActions>
			{ cancel && (
				<Button variant="text" color="secondary" onClick={ cancel.action }>
					{ cancel.label }
				</Button>
			) }
			{ discard && (
				<Button variant="text" color="secondary" onClick={ discard.action }>
					{ discard.label }
				</Button>
			) }
			<Button variant="contained" color="secondary" onClick={ onConfirm } loading={ isConfirming }>
				{ confirm.label }
			</Button>
		</DialogActions>
	);
};

SaveChangesDialog.Title = SaveChangesDialogTitle;
SaveChangesDialog.Content = SaveChangesDialogContent;
SaveChangesDialog.ContentText = SaveChangesDialogContentText;
SaveChangesDialog.Actions = SaveChangesDialogActions;

const useDialog = () => {
	const [ isOpen, setIsOpen ] = useState( false );

	const open = () => setIsOpen( true );
	const close = () => setIsOpen( false );

	return { isOpen, open, close };
};

export { SaveChangesDialog, useDialog };
