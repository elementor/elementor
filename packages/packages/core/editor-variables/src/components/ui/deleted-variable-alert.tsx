import * as React from 'react';
import { useSectionWidth } from '@elementor/editor-editing-panel';
import { Alert, AlertAction, AlertTitle, ClickAwayListener } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type DeletedVariableAlertProps = {
	onClose: () => void;
	onUnlink?: () => void;
	onRestore?: () => void;
	label: string;
};

export const DeletedVariableAlert = ( { onClose, onUnlink, onRestore, label }: DeletedVariableAlertProps ) => {
	const sectionWidth = useSectionWidth();

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
				sx={ { width: sectionWidth } }
			>
				<AlertTitle>{ __( 'Deleted variable', 'elementor' ) }</AlertTitle>
				{ __( 'The variable', 'elementor' ) } &apos;{ label }&apos;{ ' ' }
				{ __(
					'has been deleted, but it is still referenced in this location. You may restore the variable or unlink it to assign a different value.',
					'elementor'
				) }
			</Alert>
		</ClickAwayListener>
	);
};
