import * as React from 'react';
import { Alert, AlertAction, AlertTitle, ClickAwayListener, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type DeletedVariableAlertProps = {
	onClose: () => void;
	onUnlink?: () => void;
	onRestore?: () => void;
	label: string;
};

export const DeletedVariableAlert = ( { onClose, onUnlink, onRestore, label }: DeletedVariableAlertProps ) => {
	return (
		<ClickAwayListener onClickAway={ onClose }>
			<Alert
				variant="standard"
				severity="warning"
				onClose={ onClose }
				action={
					<>
						{ onUnlink && (
							<AlertAction variant="contained" onClick={ onUnlink }>
								{ __( 'Unlink', 'elementor' ) }
							</AlertAction>
						) }
						{ onRestore && (
							<AlertAction variant="outlined" onClick={ onRestore }>
								{ __( 'Restore', 'elementor' ) }
							</AlertAction>
						) }
					</>
				}
				sx={ { maxWidth: 300 } }
			>
				<AlertTitle>{ __( 'Deleted variable', 'elementor' ) }</AlertTitle>
				<Typography variant="body2" color="textPrimary">
					{ __( 'The variable', 'elementor' ) }
					&nbsp;&apos;
					<Typography variant="body2" component="span" sx={ { lineBreak: 'anywhere' } }>
						{ label }
					</Typography>
					&apos;&nbsp;
					{ __(
						'has been deleted, but it is still referenced in this location. You may restore the variable or unlink it to assign a different value.',
						'elementor'
					) }
				</Typography>
			</Alert>
		</ClickAwayListener>
	);
};
